"""Pergantian jabatan: Admin mengajukan, perangkat desa yang memutuskan.

Pembagiannya tegas dan itu inti seluruh mekanisme ini:

- `POST /pergantian` dan `GET /pergantian` — **ADMIN saja**. Ia mengajukan dan
  melihat, tidak pernah menyetujui. Pencarian warga untuk memilih kandidat ada
  di `GET /pengurus/warga` — dipakai juga saat mengisi jabatan kosong, jadi
  tempatnya bukan di sini.
- `GET /pergantian/menunggu` dan `POST /pergantian/{id}/jawab` — **pengurus
  saja**. Admin ditolak `current_pengurus`, jadi tidak ada jalan memutar lewat
  panggilan langsung.

Seluruh aturannya ada di `app/data/pergantian.py`; di sini cuma penerjemahan
ke HTTP.
"""

from fastapi import APIRouter, Depends, HTTPException

from app.api.routers.auth import current_admin, current_pengurus
from app.data import pergantian as data
from app.schemas.auth import AuthUser
from app.schemas.pergantian import (
    Jawaban,
    PengajuanBaru,
    PengajuanOut,
    SuaraOut,
)

router = APIRouter(prefix="/pergantian", tags=["pergantian"])

def _keluaran(p: data.Pengajuan) -> PengajuanOut:
    return PengajuanOut(
        id=p.id,
        jabatanKode=p.jabatan_kode,
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


@router.post("", response_model=PengajuanOut, status_code=201)
def ajukan(
    payload: PengajuanBaru, admin: AuthUser = Depends(current_admin)
) -> PengajuanOut:
    try:
        p = data.ajukan(
            jabatan_kode=payload.jabatanKode,
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
