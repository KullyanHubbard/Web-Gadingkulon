import secrets
import time

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.audit import catat_audit
from app.core.ratelimit import catat_gagal, reset_gagal, terkunci, terlalu_sering
from app.core.security import buat_token, cocok_rahasia, hash_rahasia, urai_token
from app.data.akun import (
    PETUGAS_ACCOUNTS,
    WargaAccount,
    cari_penduduk_by_nik,
    cari_warga_account,
    daftar_nik_berakun,
    hapus_warga_account,
    simpan_warga_account,
)
from app.schemas.auth import (
    AktivasiCek,
    AktivasiTiket,
    AuthUser,
    KontakPayload,
    PetugasCredentials,
    Session,
    SetPinPayload,
    WargaCredentials,
)

router = APIRouter(prefix="/auth", tags=["auth"])
_bearer = HTTPBearer(auto_error=False)

# Tiket aktivasi: sekali pakai, umur pendek (CLAUDE.md §11).
TIKET_TTL_DETIK = 10 * 60
_tiket_aktif: dict[str, tuple[str, float]] = {}

PESAN_AKTIVASI_GAGAL = (
    "NIK atau tanggal lahir tidak cocok dengan data kependudukan. "
    "Periksa kembali, atau hubungi Ketua RT Anda."
)


def _warga_user(nik: str) -> AuthUser:
    penduduk = cari_penduduk_by_nik(nik)
    akun = cari_warga_account(nik)
    if penduduk is None or akun is None:
        raise HTTPException(401, "Sesi tidak valid atau sudah kedaluwarsa.")
    return AuthUser(
        id=f"w-{nik}",
        nama=penduduk.nama,
        role="USER",
        nik=nik,
        noHp=akun.no_hp,
        email=akun.email,
    )


def _buat_sesi(user: AuthUser) -> Session:
    return Session(token=buat_token(user.id), user=user)


async def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthUser:
    """Bangun ulang `AuthUser` dari klaim token, bukan dari cache — supaya
    perubahan kontak atau reset-pin langsung berlaku tanpa login ulang."""
    if creds is None:
        raise HTTPException(401, "Sesi tidak ditemukan. Silakan masuk.")
    user_id = urai_token(creds.credentials)
    if user_id is None:
        raise HTTPException(401, "Sesi tidak valid atau sudah kedaluwarsa.")
    if user_id.startswith("w-"):
        return _warga_user(user_id.removeprefix("w-"))
    petugas = next((a for a in PETUGAS_ACCOUNTS if a.user.id == user_id), None)
    if petugas is None:
        raise HTTPException(401, "Sesi tidak valid atau sudah kedaluwarsa.")
    return petugas.user


async def current_admin(user: AuthUser = Depends(current_user)) -> AuthUser:
    if user.role != "ADMIN":
        raise HTTPException(403, "Hanya untuk pengurus.")
    return user


@router.post("/login", response_model=Session)
async def login_petugas(payload: PetugasCredentials) -> Session:
    akun = next(
        (a for a in PETUGAS_ACCOUNTS if a.username == payload.username), None
    )
    if akun is None or not cocok_rahasia(payload.password, akun.password_hash):
        raise HTTPException(401, "Username atau password salah.")
    return _buat_sesi(akun.user)


@router.post("/warga/login", response_model=Session)
async def login_warga(payload: WargaCredentials) -> Session:
    kunci = f"login-warga:{payload.nik}"
    if terkunci(kunci, batas=5, cooldown_detik=300):
        raise HTTPException(
            429, "Terlalu banyak percobaan PIN salah. Coba lagi beberapa menit lagi."
        )

    akun = cari_warga_account(payload.nik)
    penduduk = cari_penduduk_by_nik(payload.nik)
    if akun is None or penduduk is None or not cocok_rahasia(
        payload.pin, akun.pin_hash
    ):
        catat_gagal(kunci)
        raise HTTPException(401, "NIK atau PIN salah.")

    reset_gagal(kunci)
    return _buat_sesi(_warga_user(payload.nik))


@router.post("/warga/aktivasi/cek", response_model=AktivasiTiket)
async def cek_aktivasi(payload: AktivasiCek, request: Request) -> AktivasiTiket:
    ip = request.client.host if request.client else "unknown"
    if terlalu_sering(f"aktivasi:{payload.nik}:{ip}", batas=5, jendela_detik=600):
        raise HTTPException(
            429, "Terlalu banyak percobaan. Coba lagi nanti atau hubungi Ketua RT Anda."
        )

    penduduk = cari_penduduk_by_nik(payload.nik)
    if penduduk is None or penduduk.tanggalLahir != payload.tanggalLahir:
        raise HTTPException(401, PESAN_AKTIVASI_GAGAL)

    # NIK yang akunnya sudah aktif tidak boleh diklaim ulang lewat tanggal
    # lahir — kalau tidak, akun warga bisa diambil alih (CLAUDE.md §7).
    if cari_warga_account(payload.nik) is not None:
        raise HTTPException(
            409,
            "Akun untuk NIK ini sudah aktif. Silakan masuk dengan PIN Anda. "
            "Kalau lupa PIN, hubungi Ketua RT untuk direset.",
        )

    tiket = secrets.token_urlsafe(24)
    _tiket_aktif[tiket] = (payload.nik, time.monotonic() + TIKET_TTL_DETIK)
    return AktivasiTiket(tiket=tiket, nama=penduduk.nama)


@router.post("/warga/aktivasi/set-pin", response_model=Session)
async def set_pin(payload: SetPinPayload) -> Session:
    entri = _tiket_aktif.get(payload.tiket)
    if entri is None or entri[1] < time.monotonic():
        _tiket_aktif.pop(payload.tiket, None)
        raise HTTPException(
            400, "Sesi aktivasi sudah kedaluwarsa. Silakan ulangi dari awal."
        )
    nik, _ = entri
    del _tiket_aktif[payload.tiket]  # sekali pakai

    penduduk = cari_penduduk_by_nik(nik)
    if penduduk is None:
        raise HTTPException(404, "Data kependudukan tidak ditemukan.")

    simpan_warga_account(WargaAccount(nik=nik, pin_hash=hash_rahasia(payload.pin)))
    return _buat_sesi(_warga_user(nik))


@router.patch("/me/kontak", response_model=AuthUser)
async def simpan_kontak(
    payload: KontakPayload, user: AuthUser = Depends(current_user)
) -> AuthUser:
    if user.role != "USER":
        raise HTTPException(403, "Hanya warga yang punya kontak opsional.")
    akun = cari_warga_account(user.nik)
    if akun is None:
        raise HTTPException(401, "Sesi Anda sudah berakhir. Silakan masuk lagi.")
    akun.no_hp = payload.noHp
    akun.email = payload.email
    simpan_warga_account(akun)
    return _warga_user(user.nik)


@router.get("/warga/akun", response_model=list[str])
async def daftar_akun_warga(_: AuthUser = Depends(current_admin)) -> list[str]:
    """NIK yang akunnya sudah aktif — penentu munculnya tombol Reset PIN.

    Warga yang belum pernah aktivasi tidak punya PIN untuk direset; tombolnya
    tidak boleh ada supaya pengurus tidak menekan sesuatu yang tidak berlaku.
    """
    return daftar_nik_berakun()


@router.post("/warga/{nik}/reset-pin", status_code=204)
async def reset_pin_warga(nik: str, admin: AuthUser = Depends(current_admin)) -> None:
    """Hapus akun warga. Setelah ini ia kembali ke keadaan sebelum aktivasi:
    masuk lagi lewat NIK + tanggal lahir, lalu menetapkan PIN barunya sendiri.
    """
    if not hapus_warga_account(nik):
        raise HTTPException(404, "Warga ini belum pernah mengaktifkan akun.")
    catat_audit(aktor=admin.username or admin.id, aksi="reset-pin", target_nik=nik)


@router.post("/logout", status_code=204)
async def logout() -> None:
    return None
