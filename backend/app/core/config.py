"""Konfigurasi terpusat — satu-satunya tempat nilai yang bisa berbeda antar
environment (dev/staging/prod) boleh ditulis.

Dibaca dari `backend/.env` bila ada; lihat `backend/.env.example` untuk daftar
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
    # Default sengaja kelihatan jelas-jelas dev — kalau nilai ini sampai
    # terbaca di produksi, artinya `.env` belum dipasang.
    JWT_SECRET: str = "dev-only-ganti-di-produksi"
    JWT_TTL_JAM: int = 12

    # --- Seed / generator data dummy ---------------------------------------
    # Dipakai sekali saat seeding (lihat `app/data/store.py`), bukan tiap request.
    SEED_JUMLAH_KELUARGA: int = 200
    SEED_RANDOM_SEED: int = 20260814
    # 6 digit kode wilayah — jadi prefiks NIK & no KK. Salah panjang = NIK rusak
    # diam-diam, jadi divalidasi di sini, bukan di generator.
    SEED_KODE_WILAYAH: str = Field(default="320412", pattern=r"^\d{6}$")
    SEED_DESA: str = "Sukamaju"
    SEED_KECAMATAN: str = "Cibiru"
    SEED_KABUPATEN: str = "Bandung"
    SEED_PROVINSI: str = "Jawa Barat"
    SEED_KODE_POS: str = "40615"
    # Jumlah RT di tiap RW. Nomor RT-nya berurutan lintas RW — dengan
    # SEED_RW_LIST=019,020,021 dan nilai 2: RW 019 = RT 001-002, RW 020 =
    # RT 003-004, RW 021 = RT 005-006.
    SEED_RT_PER_RW: int = Field(default=2, ge=1)

    # --- Daftar bernilai jamak ---------------------------------------------
    # pydantic-settings 2.6 memaksa JSON untuk field bertipe list, padahal env
    # var enaknya ditulis "a,b,c". Jadi nilainya masuk sebagai str lewat alias,
    # lalu dibuka sebagai list[str] oleh property di bawah.
    CORS_ORIGINS_RAW: str = Field(
        default="http://localhost:5173,http://127.0.0.1:5173",
        validation_alias="CORS_ORIGINS",
    )
    SEED_RW_LIST_RAW: str = Field(default="019,020,021", validation_alias="SEED_RW_LIST")

    @property
    def DATABASE_FILE(self) -> Path:
        path = Path(self.DATABASE_PATH)
        return path if path.is_absolute() else _BACKEND_DIR / path

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return _pisah_koma(self.CORS_ORIGINS_RAW)

    @property
    def SEED_RW_LIST(self) -> list[str]:
        return _pisah_koma(self.SEED_RW_LIST_RAW)


settings = Settings()
