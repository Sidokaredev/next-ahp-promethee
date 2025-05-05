import { FnPreferensiType } from "../promethee-algrthm/draft-main";

/**
 * Constants
 */
export const prometheeInitKeyProps: Record<string, string> = {
  "Indeks Prestasi Kumulatif (IPK)": "indek_prestasi_kumulatif",
  "Semester": "semester",
  "Jurusan": "jurusan",
  "Akreditasi Perguruan Tinggi": "akreditasi"
};
export const prometheeInitKategori: Record<string, "maksimasi" | "minimasi"> = {
  "Indeks Prestasi Kumulatif (IPK)": "maksimasi",
  "Semester": "maksimasi",
  "Jurusan": "maksimasi",
  "Akreditasi Perguruan Tinggi": "maksimasi"
}
export const prometheeInitKeyFn: Record<string, (data: unknown) => number> = {
  "Indeks Prestasi Kumulatif (IPK)": (data: unknown): number => Number(data),
  "Jurusan": (data: unknown): number => {
    return preferensiJurusan.includes(data as string) ? 1 : 0;
  },
  "Akreditasi Perguruan Tinggi": (data: unknown): number => {
    return akreditasiScore[data as string];
  },
}
export const prometheeInitFnPreferensi: Record<string, FnPreferensiType> = {
  "Indeks Prestasi Kumulatif (IPK)": {
    tipe: "Tipe III",
    p: 4.00
  },
  "Semester": {
    tipe: "Tipe III",
    p: 12
  },
  "Jurusan": {
    tipe: "Tipe I"
  },
  "Akreditasi Perguruan Tinggi": {
    tipe: "Tipe III",
    p: 4
  }
}

export const prometheeInitWeight: Record<string, number> = {
  "Indeks Prestasi Kumulatif (IPK)": 0.093,
  "Semester": 0.255,
  "Jurusan": 0.600,
  "Akreditasi Perguruan Tinggi": 0.053
}

export const akreditasiScore: Record<string, number> = {
  "A": 4,
  "B": 3,
  "C": 2,
  "Tidak Terakreditasi": 1
};

export const preferensiJurusan = [
  "Ilmu Perpustakaan dan Informasi",
  "Kearsipan",
  "Manajemen Informasi",
  "Ilmu Informasi dan Perpustakaan",
  "Teknologi Informasi / Sistem Informasi",
  "Ilmu Komputer / Informatika",
  "Teknik Komputer",
  "Manajemen Informatika",
  "Administrasi Negara / Publik",
  "Administrasi Perkantoran",
  "Manajemen",
  "Sekretari",
  "Sastra / Bahasa (Indonesia atau Inggris)",
  "Komunikasi",
  "Pendidikan / PGSD / Pustakawan Sekolah",
]