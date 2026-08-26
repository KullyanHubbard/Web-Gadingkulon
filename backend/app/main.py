from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routers import (
    audit,
    auth,
    infografis,
    penduduk,
    pergantian,
    pengurus,
    publik,
)
from app.core.config import settings
from app.data.pengurus import bootstrap
from app.data.pengurus import daftar as daftar_pengurus
from app.data.store import semua_penduduk

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
    dengan bentuk yang dibaca interceptor axios di `lib/api-client.ts`.

    `headers` ikut diteruskan: tanpa itu `Retry-After` pada 429 hilang, dan
    yang tersisa cuma pesan teks.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
        headers=exc.headers,
    )


app.include_router(penduduk.router)
app.include_router(publik.router)
app.include_router(auth.router)
app.include_router(infografis.router)
app.include_router(pengurus.router)
app.include_router(pergantian.router)
app.include_router(audit.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
def _startup() -> None:
    """Bootstrap akun ADMIN pertama, lalu ringkasan keadaan data.

    Tidak ada kredensial yang dicetak: begitu tabelnya berisi data pendataan
    sungguhan, log server jadi tempat bocornya.
    """
    bootstrap()
    print("=== SIDUK backend ===")
    print(f"  Akun pengurus: {len(daftar_pengurus())} akun terdaftar")
    jumlah = len(semua_penduduk())
    if jumlah:
        print(f"  Data penduduk: {jumlah} jiwa terbaca dari DB")
    else:
        print("  Data penduduk: KOSONG — impor dulu:")
        print("    .venv/bin/python -m app.data.impor_excel ../docs/data-penduduk.xlsx")
    print("=====================")
