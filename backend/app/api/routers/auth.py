from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import buat_token, cocok_rahasia, urai_token
from app.data import pengurus as data_pengurus
from app.schemas.auth import AuthUser, PetugasCredentials, Session

router = APIRouter(prefix="/auth", tags=["auth"])
_bearer = HTTPBearer(auto_error=False)

PESAN_NONAKTIF = (
    "Akun Anda sudah dinonaktifkan. Hubungi Dukuh untuk mengaktifkannya kembali."
)


def ke_auth_user(p: data_pengurus.Pengurus) -> AuthUser:
    return AuthUser(
        id=p.id,
        nama=p.nama,
        username=p.username,
        role=p.role,  # type: ignore[arg-type]
        rw=p.rw,
        rt=p.rt,
        jabatan=p.jabatan,
    )


async def current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> AuthUser:
    """Semua pengurus yang sudah masuk.

    Dibangun ulang dari DB tiap request, bukan dari klaim token — supaya
    perubahan nama, wilayah, atau status aktif langsung berlaku tanpa login
    ulang.

    ponytail: akun yang dinonaktifkan tetap punya token yang secara kriptografi
    sah sampai TTL habis; yang menolaknya adalah pemeriksaan `aktif` di sini.
    Pindah ke sesi server-side kalau pencabutan harus lebih tegas dari itu.
    """
    if creds is None:
        raise HTTPException(401, "Sesi tidak ditemukan. Silakan masuk.")
    user_id = urai_token(creds.credentials)
    if user_id is None:
        raise HTTPException(401, "Sesi tidak valid atau sudah kedaluwarsa.")
    p = data_pengurus.cari_by_id(user_id)
    if p is None:
        raise HTTPException(401, "Sesi tidak valid atau sudah kedaluwarsa.")
    if not p.aktif:
        raise HTTPException(403, PESAN_NONAKTIF)
    return ke_auth_user(p)


async def current_admin(user: AuthUser = Depends(current_user)) -> AuthUser:
    """Kelola akun pengurus. Sengaja dipisah dari `current_user`: membaca data
    warga dan mengelola akun adalah dua kewenangan berbeda."""
    if user.role != "ADMIN":
        raise HTTPException(403, "Hanya untuk Dukuh.")
    return user


@router.post("/login", response_model=Session)
async def login(payload: PetugasCredentials) -> Session:
    hasil = data_pengurus.cari_by_username(payload.username)
    if hasil is None or not cocok_rahasia(payload.password, hasil[1]):
        raise HTTPException(401, "Username atau password salah.")
    p, _ = hasil
    # Dibedakan dari salah password: pengurus yang akunnya dimatikan perlu tahu
    # harus menghubungi siapa, bukan mengira dirinya salah ketik.
    if not p.aktif:
        raise HTTPException(403, PESAN_NONAKTIF)
    user = ke_auth_user(p)
    return Session(token=buat_token(user.id), user=user)


@router.post("/logout", status_code=204)
async def logout() -> None:
    return None
