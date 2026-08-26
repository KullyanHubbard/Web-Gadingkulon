from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.routers.auth import current_pengurus
from app.data.agregat import kelompok_umur, umur
from app.data import store
from app.data.store import penduduk_untuk
from app.schemas.auth import AuthUser
from app.schemas.penduduk import (
    FilterOpsi,
    PaginatedPenduduk,
    Penduduk,
    PendudukBaru,
    PendudukUbah,
)

router = APIRouter(tags=["penduduk"])

# Filter yang cukup dibandingkan sama-persis dengan satu field `Penduduk`.
# Ditulis sebagai daftar supaya menambah filter enum baru = satu baris di sini,
# bukan satu cabang `if` lagi di dalam fungsi.
_FILTER_LANGSUNG = (
    "jenisKelamin",
    "agama",
    "golonganDarah",
    "pendidikan",
    "statusPerkawinan",
    "statusHubunganKeluarga",
)


def saring(
    daftar: list[Penduduk],
    *,
    search: str = "",
    pekerjaan: str = "",
    rt: str = "",
    rw: str = "",
    kelompokUmur: str = "",
    **enum_filter: str,
) -> list[Penduduk]:
    """Semua filter digabung AND; nilai kosong tidak menyaring apa pun.

    `search` cuma mencocokkan nama — NIK & Nomor KK tidak disimpan lagi.

    ponytail: disaring di memori atas cache `store.py`, bukan lewat SQL — data
    satu padukuhan muat di RAM dan sudah dimuat saat start. Pindah ke WHERE
    clause kalau datanya nanti puluhan ribu baris.
    """
    q = search.strip().lower()
    hasil = daftar
    if q:
        hasil = [p for p in hasil if q in p.nama.lower()]
    for field in _FILTER_LANGSUNG:
        nilai = enum_filter.get(field, "")
        if nilai:
            hasil = [p for p in hasil if getattr(p, field) == nilai]
    if pekerjaan:
        hasil = [p for p in hasil if p.pekerjaan == pekerjaan]
    if rt:
        hasil = [p for p in hasil if p.alamat.rt == rt]
    if rw:
        hasil = [p for p in hasil if p.alamat.rw == rw]
    if kelompokUmur:
        hasil = [
            p for p in hasil if kelompok_umur(umur(p.tanggalLahir)) == kelompokUmur
        ]
    return hasil


@router.get("/penduduk", response_model=PaginatedPenduduk)
def list_penduduk(
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=200),
    search: str = "",
    jenisKelamin: str = "",
    agama: str = "",
    golonganDarah: str = "",
    pendidikan: str = "",
    statusPerkawinan: str = "",
    statusHubunganKeluarga: str = "",
    pekerjaan: str = "",
    rt: str = "",
    rw: str = "",
    kelompokUmur: str = "",
    user: AuthUser = Depends(current_pengurus),
) -> PaginatedPenduduk:
    hasil = saring(
        penduduk_untuk(user),
        search=search,
        pekerjaan=pekerjaan,
        rt=rt,
        rw=rw,
        kelompokUmur=kelompokUmur,
        jenisKelamin=jenisKelamin,
        agama=agama,
        golonganDarah=golonganDarah,
        pendidikan=pendidikan,
        statusPerkawinan=statusPerkawinan,
        statusHubunganKeluarga=statusHubunganKeluarga,
    )
    start = (page - 1) * pageSize
    return PaginatedPenduduk(
        items=hasil[start : start + pageSize],
        total=len(hasil),
        page=page,
        pageSize=pageSize,
    )


# Ditulis SEBELUM `/penduduk/{id}`: rute statis harus menang atas rute
# ber-parameter, kalau tidak "filter-opsi" akan terbaca sebagai sebuah id.
@router.get("/penduduk/filter-opsi", response_model=FilterOpsi)
def filter_opsi(user: AuthUser = Depends(current_pengurus)) -> FilterOpsi:
    """Pilihan filter yang bukan enum — hanya bisa diketahui dari isi data.

    Ikut menyempit sesuai wilayah pemanggilnya: Ketua RT 004 tidak melihat
    daftar RT lain di dropdown-nya.

    `pekerjaan` teks bebas di Excel, jadi daftarnya ikut kotor kalau pengurus
    mengetik tidak konsisten. Diterima sadar: daftar pekerjaan satu padukuhan
    tidak bisa dijadikan enum tertutup dari awal.
    """
    milik_saya = penduduk_untuk(user)
    return FilterOpsi(
        rt=sorted({p.alamat.rt for p in milik_saya}),
        rw=sorted({p.alamat.rw for p in milik_saya}),
        pekerjaan=sorted({p.pekerjaan for p in milik_saya if p.pekerjaan}),
    )


@router.get("/penduduk/{id}", response_model=Penduduk)
def get_by_id(id: str, user: AuthUser = Depends(current_pengurus)) -> Penduduk:
    """404 — bukan 403 — untuk warga di luar wilayahnya. 403 memberi tahu bahwa
    orang itu ada; 404 tidak memberi tahu apa-apa."""
    for p in penduduk_untuk(user):
        if p.id == id:
            return p
    raise HTTPException(status_code=404, detail="Penduduk tidak ditemukan")


@router.post("/penduduk", response_model=Penduduk, status_code=201)
def tambah_penduduk(
    payload: PendudukBaru, user: AuthUser = Depends(current_pengurus)
) -> Penduduk:
    """Tambah warga baru di wilayah pengurus ini. Kode Warganya dibangkitkan
    aplikasi."""
    try:
        return store.tambah_warga(user, payload.model_dump())
    except store.TidakBoleh as e:
        raise HTTPException(403, str(e))


@router.patch("/penduduk/{id}", response_model=Penduduk)
def ubah_penduduk(
    id: str, payload: PendudukUbah, user: AuthUser = Depends(current_pengurus)
) -> Penduduk:
    """Ubah data satu warga. Field yang tidak dikirim tidak disentuh.

    Mengubah RT/RW (memindahkan warga) hanya boleh Dukuh — lihat
    `app/data/store.py:ubah_warga`.
    """
    ubahan = payload.model_dump(exclude_unset=True)
    if "alamat" in ubahan and ubahan["alamat"] is not None:
        ubahan["alamat"] = {
            k: v for k, v in ubahan["alamat"].items() if v is not None
        }
    try:
        return store.ubah_warga(user, id, ubahan)
    except store.TidakBoleh as e:
        # 404 kalau memang tidak terlihat olehnya; 403 kalau terlihat tapi
        # tindakannya yang dilarang.
        raise HTTPException(404 if "tidak ditemukan" in str(e) else 403, str(e))
