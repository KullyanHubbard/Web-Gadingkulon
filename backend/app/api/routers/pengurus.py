"""Kelola akun perangkat desa. ADMIN saja.

Yang dikelola adalah **jabatan** (Dukuh, Ketua RW 019, Ketua RT 001, …), bukan
sekadar daftar akun: satu jabatan dipegang satu orang, dan orangnya berganti
sewaktu-waktu. Daftar jabatannya diturunkan dari alamat warga di data
penduduk.

Tidak ada DELETE: akun yang pernah dipakai tidak dihapus, cukup dinonaktifkan
(`aktif = 0`). Menghapusnya membuat jejak audit menunjuk ke akun yang tidak
ada lagi.

**Tidak ada cara mengosongkan jabatan dari sini.** Jabatan hanya menjadi
kosong lewat pergantian yang disetujui (`app/api/routers/pergantian.py`). Kalau
Admin masih bisa mencabut akses sendiri, ia bisa mengosongkannya lalu mengisi
langsung — dan seluruh mekanisme persetujuan jadi hiasan yang bisa dilewati
dalam dua klik.
"""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.routers.auth import current_admin, ke_auth_user
from app.core.audit import catat_audit
from app.data import lpm as data_lpm
from app.data import pengurus as data
from app.data import sesi as data_sesi
from app.data.store import semua_penduduk
from app.schemas.auth import AuthUser
from app.schemas.pengurus import (
    CalonOut,
    JabatanOut,
    LpmUbah,
    WargaPilihan,
    PasswordBaru,
    PengurusBaru,
    PengurusOut,
)

router = APIRouter(
    prefix="/pengurus",
    tags=["pengurus"],
    dependencies=[Depends(current_admin)],
)


def _keluaran(p: data.Pengurus) -> PengurusOut:
    return PengurusOut(**ke_auth_user(p).model_dump(), aktif=p.aktif)


@router.get("", response_model=list[JabatanOut])
def daftar_jabatan() -> list[JabatanOut]:
    """Seluruh jabatan padukuhan, terisi maupun kosong.

    Yang dikembalikan jabatan, bukan akun: halaman Admin memang menampilkan
    jabatan yang ada di padukuhan, termasuk yang belum ada pemegangnya.
    """
    return [
        JabatanOut(
            kode=j.kode,
            role=j.role,  # type: ignore[arg-type]
            rw=j.rw,
            rt=j.rt,
            label=j.label,
            pemegang=_keluaran(j.pemegang) if j.pemegang else None,
            calon=CalonOut(id=j.calon.id, nama=j.calon.nama) if j.calon else None,
        )
        for j in data.daftar_jabatan()
    ]


# Dropdown tidak pernah menampilkan seluruh warga sekaligus: Admin mengetik
# dulu, dan hasilnya dipotong. Tidak menutup celahnya, tapi membuat "unduh
# seluruh daftar warga" bukan sesuatu yang terjadi dengan satu klik.
MIN_CARI = 2
MAKS_HASIL = 20


def _warga_untuk_jabatan(warga_id: str, role: str, rw: str | None, rt: str | None):
    """Warga yang sah memegang jabatan ini, atau `HTTPException` yang
    menjelaskan kenapa tidak."""
    warga = next((w for w in semua_penduduk() if w.id == warga_id), None)
    if warga is None or warga.statusKependudukan != "AKTIF":
        raise HTTPException(404, "Warga tidak ditemukan atau sudah tidak aktif.")
    if not data.cocok_wilayah(role, rw, rt, warga.alamat.rw, warga.alamat.rt):
        raise HTTPException(
            409,
            f"{warga.nama} warga RT {warga.alamat.rt}/RW {warga.alamat.rw}, "
            f"tidak bisa memegang jabatan {data.jabatan_dari(role, rw, rt)}.",
        )
    return warga


@router.get("/warga", response_model=list[WargaPilihan])
def cari_warga(
    q: str = Query(""),
    jabatanKode: str = Query(""),
    _admin: AuthUser = Depends(current_admin),
) -> list[WargaPilihan]:
    """Cari warga untuk dipilih Admin — mengisi jabatan kosong maupun
    mengajukan pergantian. Nama + RT/RW saja.

    `jabatanKode` opsional: kalau diisi, hasilnya cuma warga yang boleh memegang
    jabatan itu (Ketua RT dari RT-nya, Ketua RW dari RW-nya, Dukuh dari mana
    pun).

    Ini satu-satunya celah Admin ke data warga, dan tidak terhindarkan: ia harus
    bisa menunjuk orang. Yang bisa dilakukan adalah membuatnya sesempit
    mungkin — tidak ada tanggal lahir, agama, pekerjaan, maupun alamat jalan.

    Ditulis SEBELUM rute ber-parameter mana pun di router ini supaya "warga"
    tidak terbaca sebagai sebuah id.
    """
    kata = q.strip().lower()
    if len(kata) < MIN_CARI:
        return []
    # `jabatanKode` mempersempit hasil ke warga yang memang boleh memegangnya.
    # Bukan sekadar kenyamanan: makin sempit, makin sedikit data warga yang
    # terbuka untuk Admin.
    target = next(
        (j for j in data.daftar_jabatan() if j.kode == jabatanKode), None
    )
    cocok = [
        w
        for w in semua_penduduk()
        if kata in w.nama.lower()
        and w.statusKependudukan == "AKTIF"
        and (
            target is None
            or data.cocok_wilayah(
                target.role, target.rw, target.rt, w.alamat.rw, w.alamat.rt
            )
        )
    ]
    return [
        WargaPilihan(id=w.id, nama=w.nama, rt=w.alamat.rt, rw=w.alamat.rw)
        for w in cocok[:MAKS_HASIL]
    ]


@router.post("", response_model=PengurusOut, status_code=201)
def tambah_pengurus(
    payload: PengurusBaru, admin: AuthUser = Depends(current_admin)
) -> PengurusOut:
    warga = _warga_untuk_jabatan(
        payload.wargaId, payload.role, payload.rw, payload.rt
    )
    try:
        baru = data.tambah(
            username=payload.username,
            password=payload.password,
            nama=warga.nama,
            role=payload.role,
            rw=payload.rw,
            rt=payload.rt,
            warga_id=warga.id,
        )
    except ValueError as e:
        raise HTTPException(409, str(e))
    catat_audit(
        aktor=admin.username,
        aksi="tambah-pengurus",
        sasaran=baru.username,
        sasaran_id=baru.id,
    )
    return _keluaran(baru)


@router.patch("/lpm")
def ubah_lpm(
    payload: LpmUbah, admin: AuthUser = Depends(current_admin)
) -> dict[str, str]:
    """Ganti nama Ketua LPM. Bukan jabatan berakun — tanpa login, tanpa
    persetujuan siapa pun, beda dari seluruh jabatan lain di router ini.
    Path statis (`lpm`), tidak pernah tertangkap oleh `/{id}/...` di bawahnya.
    """
    lama = data_lpm.nama()
    baru = data_lpm.ubah(payload.nama.strip())
    catat_audit(
        aktor=admin.username,
        aksi="ubah-lpm",
        sasaran="Ketua LPM",
        perubahan=f"{lama or '(kosong)'} → {baru or '(kosong)'}",
    )
    return {"nama": baru}


@router.post("/{id}/reset-password", status_code=204)
def reset_password(
    id: str, payload: PasswordBaru, admin: AuthUser = Depends(current_admin)
) -> None:
    target = data.cari_by_id(id)
    if target is None or not data.ganti_password(
        id, payload.password, oleh_admin=True
    ):
        raise HTTPException(404, "Akun pengurus tidak ditemukan.")
    # Sesi lama dicabut: kalau tidak, orang yang masih memegang sesi berjalan
    # tetap bisa memakai akun itu walau passwordnya sudah diganti — dan reset
    # password justru dilakukan ketika ada kecurigaan seperti itu.
    data_sesi.akhiri_semua(id)
    catat_audit(
        aktor=admin.username,
        aksi="reset-password",
        sasaran=target.username,
        sasaran_id=target.id,
    )
