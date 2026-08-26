"""Konfigurasi terpusat — satu-satunya tempat nilai yang bisa berbeda antar
environment (dev/staging/prod) boleh ditulis.

Dibaca dari `backend/.env` bila ada; lihat `backend/README.md` untuk daftar
lengkapnya. Setiap field punya default yang aman untuk dev, jadi repo tetap
jalan tanpa `.env` sama sekali.

Nama field sengaja `UPPER_SNAKE_CASE` biar 1:1 dengan nama env var — tidak ada
aturan pemetaan yang perlu diingat. Ekspornya satu: `settings`. Jangan bikin
getter tersebar.
"""

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parents[2]


def _pisah_koma(nilai: str) -> list[str]:
    return [bagian.strip() for bagian in nilai.split(",") if bagian.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Runtime -----------------------------------------------------------
    # Path file SQLite, bukan URL — yang membacanya `sqlite3` stdlib, dan itu
    # cuma mau path. Relatif dihitung dari `backend/`, jadi hasilnya sama dari
    # direktori kerja mana pun uvicorn dijalankan; lihat `DATABASE_FILE`.
    DATABASE_PATH: str = "./data/siduk.db"
    # Umur sesi login. Tidak ada rahasia yang perlu dipasang: sejak sesi
    # tersimpan di server, token cuma nomor acak dan tidak ada yang
    # ditandatangani — jadi tidak ada nilai bawaan yang bisa salah terpakai.
    SESI_TTL_JAM: int = 12

    # --- Bootstrap ADMIN pertama -------------------------------------------
    # Dipakai HANYA saat tabel `pengurus` masih kosong. Kalau kosong dan dua
    # nilai ini belum diisi, backend menolak jalan — memakai default berarti
    # ada instalasi yang berjalan dengan password yang tertulis di kode publik.
    ADMIN_USERNAME: str = ""
    ADMIN_PASSWORD: str = ""

    # --- Daftar bernilai jamak ---------------------------------------------
    # pydantic-settings 2.6 memaksa JSON untuk field bertipe list, padahal env
    # var enaknya ditulis "a,b,c". Jadi nilainya masuk sebagai str lewat alias,
    # lalu dibuka sebagai list[str] oleh property di bawah.
    CORS_ORIGINS_RAW: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        validation_alias="CORS_ORIGINS",
    )

    @property
    def DATABASE_FILE(self) -> Path:
        path = Path(self.DATABASE_PATH)
        return path if path.is_absolute() else _BACKEND_DIR / path

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return _pisah_koma(self.CORS_ORIGINS_RAW)


settings = Settings()
