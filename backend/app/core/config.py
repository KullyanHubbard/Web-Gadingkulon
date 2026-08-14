"""Konfigurasi minimal. Menyusul: baca dari env var kalau backend deploy ke
lebih dari satu environment (dev/staging/prod)."""

CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
