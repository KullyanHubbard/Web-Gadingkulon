from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.routers.auth import current_admin, current_user
from app.data.dummy import DAFTAR_PENDUDUK, KARTU_KELUARGA_BY_NOKK
from app.schemas.auth import AuthUser
from app.schemas.penduduk import KartuKeluarga, PaginatedPenduduk, Penduduk

router = APIRouter(tags=["penduduk"])


@router.get("/penduduk", response_model=PaginatedPenduduk)
def list_penduduk(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=200),
    search: str = "",
    _admin: AuthUser = Depends(current_admin),
) -> PaginatedPenduduk:
    q = search.strip().lower()
    filtered = (
        [
            p
            for p in DAFTAR_PENDUDUK
            if q in p.nama.lower() or q in p.nik or q in p.noKK
        ]
        if q
        else DAFTAR_PENDUDUK
    )
    start = (page - 1) * pageSize
    return PaginatedPenduduk(
        items=filtered[start : start + pageSize],
        total=len(filtered),
        page=page,
        pageSize=pageSize,
    )


@router.get("/penduduk/nik/{nik}", response_model=Penduduk)
def get_by_nik(nik: str, user: AuthUser = Depends(current_user)) -> Penduduk:
    # USER hanya boleh NIK miliknya sendiri — divalidasi dari klaim JWT,
    # bukan dari parameter request (CLAUDE.md §11).
    if user.role != "ADMIN" and user.nik != nik:
        raise HTTPException(403, "Anda hanya boleh mengakses data NIK sendiri.")
    for p in DAFTAR_PENDUDUK:
        if p.nik == nik:
            return p
    raise HTTPException(status_code=404, detail="Penduduk tidak ditemukan")


@router.get("/kartu-keluarga/{no_kk}", response_model=KartuKeluarga)
def get_kartu_keluarga(
    no_kk: str, user: AuthUser = Depends(current_user)
) -> KartuKeluarga:
    kk = KARTU_KELUARGA_BY_NOKK.get(no_kk)
    if kk is None:
        raise HTTPException(status_code=404, detail="Kartu Keluarga tidak ditemukan")
    if user.role != "ADMIN" and not any(p.nik == user.nik for p in kk.anggota):
        raise HTTPException(403, "Anda hanya boleh mengakses Kartu Keluarga sendiri.")
    return kk
