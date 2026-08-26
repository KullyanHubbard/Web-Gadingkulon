"""Cerminan frontend/src/features/infografis/types.ts."""

from pydantic import BaseModel

from app.schemas.penduduk import Distribusi


class InfografisData(BaseModel):
    totalPenduduk: int
    totalLakiLaki: int
    totalPerempuan: int
    perAgama: list[Distribusi]
    perKelompokUmur: list[Distribusi]
    perPendidikan: list[Distribusi]
    perStatusPerkawinan: list[Distribusi]
    perDusun: list[Distribusi]
