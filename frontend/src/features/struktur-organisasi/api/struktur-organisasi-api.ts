import { apiClient } from '@/lib/api-client';
import type { StrukturOrganisasiPublik } from '../types';

/**
 * Kontrak bagan pengurus publik — tanpa auth, sama seperti `statistikPublikApi`.
 *
 * Terpisah dari fitur `pengurus` (kelola akun ADMIN) dengan sengaja: yang itu
 * di balik login dan membawa username/status akun, sedangkan ini terbuka
 * untuk siapa saja dan cuma membawa nama.
 */
export interface StrukturOrganisasiApi {
  get(): Promise<StrukturOrganisasiPublik>;
}

export const strukturOrganisasiApi: StrukturOrganisasiApi = {
  async get() {
    const { data } = await apiClient.get<StrukturOrganisasiPublik>(
      '/publik/struktur-organisasi',
    );
    return data;
  },
};
