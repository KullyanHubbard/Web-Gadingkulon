"""Pergantian jabatan — cerminan `frontend/src/features/pergantian/types.ts`."""

from typing import Literal, Optional

from pydantic import BaseModel

from app.schemas.auth import Role

StatusPengajuan = Literal["MENUNGGU", "DISETUJUI", "DITOLAK", "GUGUR"]


class SuaraOut(BaseModel):
    pengurusId: str
    nama: str
    jabatan: str
    setuju: bool
    pada: str


class PengajuanOut(BaseModel):
    id: str
    kursi: str
    role: Role
    rw: Optional[str] = None
    rt: Optional[str] = None
    jabatan: str
    kandidatId: str
    kandidatNama: str
    kandidatRt: str
    kandidatRw: str
    status: StatusPengajuan
    diajukanOleh: str
    diajukanPada: str
    selesaiPada: Optional[str] = None
    sebab: Optional[str] = None
    suara: list[SuaraOut] = []


class PengajuanBaru(BaseModel):
    kursi: str
    kandidatId: str


class Jawaban(BaseModel):
    setuju: bool


class KandidatOut(BaseModel):
    """Sepotong data warga sekadar untuk dropdown pemilihan kandidat.

    Admin buta terhadap data warga, dan ini satu-satunya celahnya: nama + RT/RW
    saja, tidak ada tanggal lahir, agama, pekerjaan, maupun alamat jalan.
    Celah ini tidak terhindarkan — Admin harus bisa menunjuk orang — jadi yang
    bisa dilakukan adalah membuatnya sesempit mungkin.
    """

    id: str
    nama: str
    rt: str
    rw: str
