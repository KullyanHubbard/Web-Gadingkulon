"""Kelola akun perangkat desa. ADMIN saja.

Yang dikelola adalah **kursi** (Dukuh, Ketua RW 019, Ketua RT 001, …), bukan
sekadar daftar akun: satu kursi dihuni satu orang, dan orangnya berganti
sewaktu-waktu. Daftar kursinya diturunkan dari alamat warga di data penduduk.

Tidak ada DELETE: akun yang pernah dipakai tidak dihapus, cukup dinonaktifkan
(`aktif = 0`). Menghapusnya membuat jejak audit menunjuk ke akun yang tidak
ada lagi.

**Tidak ada cara mengosongkan kursi dari sini.** Kursi hanya menjadi kosong
lewat pergantian yang disetujui (`app/api/routers/pergantian.py`). Kalau Admin
masih bisa mencabut akses sendiri, ia bisa mengosongkan kursi lalu mengisinya
langsung — dan seluruh mekanisme persetujuan jadi hiasan yang bisa dilewati
dalam dua klik.
"""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.routers.auth import current_admin, ke_auth_user
from app.core.audit import catat_audit
from app.data import pengurus as data
from app.data.store import DAFTAR_PENDUDUK
from app.schemas.auth import AuthUser
from app.schemas.pengurus import (
    CalonOut,
    KursiOut,
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


@router.get("", response_model=list[KursiOut])
def daftar_kursi() -> list[KursiOut]:
    """Seluruh kursi padukuhan, terisi maupun kosong.

    Yang dikembalikan kursi, bukan akun: halaman Admin memang menampilkan
    jabatan yang ada di padukuhan, termasuk yang belum ada penghuninya.
    """
    return [
        KursiOut(
            kursi=k.kursi,
            role=k.role,  # type: ignore[arg-type]
            rw=k.rw,
            rt=k.rt,
            jabatan=k.jabatan,
            penghuni=_keluaran(k.penghuni) if k.penghuni else None,
            calon=CalonOut(id=k.calon.id, nama=k.calon.nama) if k.calon else None,
        )
        for k in data.daftar_kursi()
    ]


# Dropdown tidak pernah menampilkan seluruh warga sekaligus: Admin mengetik
# dulu, dan hasilnya dipotong. Tidak menutup celahnya, tapi membuat "unduh
# seluruh daftar warga" bukan sesuatu yang terjadi dengan satu klik.
MIN_CARI = 2
MAKS_HASIL = 20


def _warga_untuk_kursi(warga_id: str, role: str, rw: str | None, rt: str | None):
    """Warga yang sah menduduki kursi ini, atau `HTTPException` yang menjelaskan
    kenapa tidak."""
    warga = next((w for w in DAFTAR_PENDUDUK if w.id == warga_id), None)
    if warga is None or warga.statusKependudukan != "AKTIF":
        raise HTTPException(404, "Warga tidak ditemukan atau sudah tidak aktif.")
    if not data.cocok_wilayah(role, rw, rt, warga.alamat.rw, warga.alamat.rt):
        raise HTTPException(
            409,
            f"{warga.nama} warga RT {warga.alamat.rt}/RW {warga.alamat.rw}, "
            f"tidak bisa menduduki kursi {data.jabatan_dari(role, rw, rt)}.",
        )
    return warga


@router.get("/warga", response_model=list[WargaPilihan])
def cari_warga(
    q: str = Query(""),
    kursi: str = Query(""),
    _admin: AuthUser = Depends(current_admin),
) -> list[WargaPilihan]:
    """Cari warga untuk dipilih Admin — mengisi kursi kosong maupun mengajukan
    pergantian. Nama + RT/RW saja.

    `kursi` opsional: kalau diisi, hasilnya cuma warga yang boleh menduduki
    kursi itu (Ketua RT dari RT-nya, Ketua RW dari RW-nya, Dukuh dari mana pun).

    Ini satu-satunya celah Admin ke data warga, dan tidak terhindarkan: ia harus
    bisa menunjuk orang. Yang bisa dilakukan adalah membuatnya sesempit
    mungkin — tidak ada tanggal lahir, agama, pekerjaan, maupun alamat jalan.

    Ditulis SEBELUM rute ber-parameter mana pun di router ini supaya "warga"
    tidak terbaca sebagai sebuah id.
    """
    kata = q.strip().lower()
    if len(kata) < MIN_CARI:
        return []
    # `kursi` mempersempit hasil ke warga yang memang boleh mendudukinya. Bukan
    # sekadar kenyamanan: makin sempit, makin sedikit data warga yang terbuka
    # untuk Admin.
    target = next((k for k in data.daftar_kursi() if k.kursi == kursi), None)
    cocok = [
        w
        for w in DAFTAR_PENDUDUK
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
    warga = _warga_untuk_kursi(
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
        )
    except ValueError as e:
        raise HTTPException(409, str(e))
    catat_audit(aktor=admin.username, aksi="tambah-pengurus", target=baru.username)
    return _keluaran(baru)


@router.post("/{id}/reset-password", status_code=204)
def reset_password(
    id: str, payload: PasswordBaru, admin: AuthUser = Depends(current_admin)
) -> None:
    target = data.cari_by_id(id)
    if target is None or not data.ganti_password(
        id, payload.password, oleh_admin=True
    ):
        raise HTTPException(404, "Akun pengurus tidak ditemukan.")
    catat_audit(aktor=admin.username, aksi="reset-password", target=target.username)
