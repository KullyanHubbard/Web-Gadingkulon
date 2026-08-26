"""Pergantian jabatan: Admin mengajukan, perangkat desa yang memutuskan.

Pembagiannya tegas dan itu inti seluruh mekanisme ini:

- `POST /pergantian` dan `GET /pergantian` — **ADMIN saja**. Ia mengajukan dan
  melihat, tidak pernah menyetujui.
- `GET /pergantian/menunggu` dan `POST /pergantian/{id}/jawab` — **pengurus
  saja**. Admin ditolak `current_pengurus`, jadi tidak ada jalan memutar lewat
  panggilan langsung.

Seluruh aturannya ada di `app/data/pergantian.py`; di sini cuma penerjemahan
ke HTTP.
"""

from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.routers.auth import current_admin, current_pengurus
from app.data import pergantian as data
from app.data.store import DAFTAR_PENDUDUK
from app.schemas.auth import AuthUser
from app.schemas.pergantian import (
    Jawaban,
    KandidatOut,
    PengajuanBaru,
    PengajuanOut,
    SuaraOut,
)

router = APIRouter(prefix="/pergantian", tags=["pergantian"])

# Dropdown tidak pernah menampilkan seluruh warga sekaligus: Admin mengetik
# dulu, dan hasilnya dipotong. Tidak menutup celahnya, tapi membuat "unduh
# seluruh daftar warga" bukan sesuatu yang terjadi dengan satu klik.
MIN_CARI = 2
MAKS_HASIL = 20


def _keluaran(p: data.Pengajuan) -> PengajuanOut:
    return PengajuanOut(
        id=p.id,
        kursi=p.kursi,
        role=p.role,  # type: ignore[arg-type]
        rw=p.rw,
        rt=p.rt,
        jabatan=p.jabatan,
        kandidatId=p.kandidat_id,
        kandidatNama=p.kandidat_nama,
        kandidatRt=p.kandidat_rt,
        kandidatRw=p.kandidat_rw,
        status=p.status,  # type: ignore[arg-type]
        diajukanOleh=p.diajukan_oleh,
        diajukanPada=p.diajukan_pada,
        selesaiPada=p.selesai_pada,
        sebab=p.sebab,
        suara=[
            SuaraOut(
                pengurusId=s.pengurus_id,
                nama=s.nama,
                jabatan=s.jabatan,
                setuju=s.setuju,
                pada=s.pada,
            )
            for s in p.suara
        ],
    )


@router.get("", response_model=list[PengajuanOut])
def daftar_pengajuan(_admin: AuthUser = Depends(current_admin)) -> list[PengajuanOut]:
    """Seluruh pengajuan beserta riwayatnya, terbaru dulu."""
    return [_keluaran(p) for p in data.daftar()]


@router.get("/kandidat", response_model=list[KandidatOut])
def cari_kandidat(
    q: str = Query("", min_length=0),
    _admin: AuthUser = Depends(current_admin),
) -> list[KandidatOut]:
    """Cari warga untuk dropdown kandidat. Nama + RT/RW saja."""
    kata = q.strip().lower()
    if len(kata) < MIN_CARI:
        return []
    cocok = [
        w
        for w in DAFTAR_PENDUDUK
        if kata in w.nama.lower() and w.statusKependudukan == "AKTIF"
    ]
    return [
        KandidatOut(id=w.id, nama=w.nama, rt=w.alamat.rt, rw=w.alamat.rw)
        for w in cocok[:MAKS_HASIL]
    ]


@router.post("", response_model=PengajuanOut, status_code=201)
def ajukan(
    payload: PengajuanBaru, admin: AuthUser = Depends(current_admin)
) -> PengajuanOut:
    try:
        p = data.ajukan(
            kursi=payload.kursi,
            kandidat_id=payload.kandidatId,
            oleh=admin.username,
        )
    except data.TidakBoleh as e:
        raise HTTPException(409, str(e))
    return _keluaran(p)


@router.get("/menunggu", response_model=list[PengajuanOut])
def menunggu_jawaban_saya(
    user: AuthUser = Depends(current_pengurus),
) -> list[PengajuanOut]:
    """Pengajuan yang menunggu jawaban orang ini, dan hanya itu."""
    return [_keluaran(p) for p in data.menunggu_jawaban(user.id)]


@router.post("/{id}/jawab", response_model=PengajuanOut)
def jawab(
    id: str, payload: Jawaban, user: AuthUser = Depends(current_pengurus)
) -> PengajuanOut:
    try:
        p = data.jawab(pengajuan_id=id, pengurus_id=user.id, setuju=payload.setuju)
    except data.TidakBoleh as e:
        raise HTTPException(409, str(e))
    return _keluaran(p)
