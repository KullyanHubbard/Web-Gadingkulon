from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routers import (
    auth,
    infografis,
    penduduk,
    pergantian,
    pengurus,
    publik,
)
from app.core.config import BAWAAN_JWT_SECRET, settings
from app.data.pengurus import bootstrap
from app.data.pengurus import daftar as daftar_pengurus
from app.data.store import DAFTAR_PENDUDUK

app = FastAPI(title="SIDUK API", description="Data penduduk dari pendataan Excel — lihat CLAUDE.md §11")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException) -> JSONResponse:
    """`{"message": ...}`, bukan default `{"detail": ...}` FastAPI — samakan
    dengan bentuk yang dibaca interceptor axios di `lib/api-client.ts`."""
    return JSONResponse(status_code=exc.status_code, content={"message": exc.detail})


app.include_router(penduduk.router)
app.include_router(publik.router)
app.include_router(auth.router)
app.include_router(infografis.router)
app.include_router(pengurus.router)
app.include_router(pergantian.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def _wajib_diisi() -> None:
    """Berhenti kalau nilai rahasia masih bawaan.

    Diperlakukan sama tegas dengan ADMIN_PASSWORD, dan alasannya sama: kunci
    contoh ini tertulis di kode yang bisa dibaca siapa saja, jadi siapa pun
    bisa membuat token masuk palsu untuk akun mana pun. Menolak jalan lebih
    baik daripada berjalan dengan pintu yang tidak terkunci.
    """
    if settings.JWT_SECRET == BAWAAN_JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET masih memakai nilai bawaan yang tertulis di kode.\n"
            "Isi JWT_SECRET di backend/.env dengan nilai acak panjang, mis.:\n"
            "  python3 -c \"import secrets; print(secrets.token_urlsafe(48))\""
        )


@app.on_event("startup")
def _startup() -> None:
    """Bootstrap akun ADMIN pertama, lalu ringkasan keadaan data.

    Tidak ada kredensial yang dicetak: begitu tabelnya berisi data pendataan
    sungguhan, log server jadi tempat bocornya.
    """
    _wajib_diisi()
    bootstrap()
    print("=== SIDUK backend ===")
    print(f"  Akun pengurus: {len(daftar_pengurus())} akun terdaftar")
    if DAFTAR_PENDUDUK:
        print(f"  Data penduduk: {len(DAFTAR_PENDUDUK)} jiwa terbaca dari DB")
    else:
        print("  Data penduduk: KOSONG — impor dulu:")
        print("    .venv/bin/python -m app.data.impor_excel ../docs/data-penduduk.xlsx")
    print("=====================")
