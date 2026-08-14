from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routers import auth, infografis, penduduk, publik
from app.core.config import CORS_ORIGINS
from app.data.akun import (
    DEMO_WARGA_AKTIF_NIK,
    DEMO_WARGA_AKTIF_PIN,
    DEMO_WARGA_AKTIVASI_NIK,
    DEMO_WARGA_AKTIVASI_TANGGAL_LAHIR,
)

app = FastAPI(title="NIA API", description="Backend dummy — lihat CLAUDE.md §11")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
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


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
def _cetak_akun_demo() -> None:
    print("=== Akun demo backend dummy ===")
    print("  Petugas — dukuh / dukuh123")
    print("  Petugas — rt03 / rt123")
    print(f"  Warga (sudah aktif) — NIK {DEMO_WARGA_AKTIF_NIK} / PIN {DEMO_WARGA_AKTIF_PIN}")
    print(
        f"  Warga (belum aktivasi) — NIK {DEMO_WARGA_AKTIVASI_NIK} / "
        f"tanggal lahir {DEMO_WARGA_AKTIVASI_TANGGAL_LAHIR}"
    )
    print("================================")
