import { DataAlternatifType } from "../administrator/pendaftar";

export class Promethee {
  kriteria: string[] = [];
  bobotKriteria: Record<string, string> = {};
  fungsiPreferensi: Record<string, string> = {};

  akreditasiScore: Record<string, number> = {
    "A": 4,
    "B": 3,
    "C": 2,
    "Tidak Terakreditasi": 1
  };
  preferensiJurusan = [
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

  dataAlternative: DataAlternatifType[] = [];
  dataAlternativeKey: Record<string, string> = {
    "Indeks Prestasi Kumulatif (IPK)": "indek_prestasi_kumulatif",
    "Semester": "semester",
    "Jurusan": "jurusan",
    "Akreditasi Perguruan Tinggi": "akreditasi",
  }
  dataAlternativeKeyFn: Record<string, (data: string) => number> = {
    "Semester": (key: string) => {
      return this.akreditasiScore[key];
    },
    "Indeks Prestasi Kumulatif (IPK)": (decimalStr: string) => {
      return Number(decimalStr);
    },
    // "Jurusan": (data: string) => 
  }

  static tipeFungsiPreferensi: Record<string, string> = {
    "Tipe 1": "Usual Criterion",
    "Tipe 2": "U-shape Criterion",
    "Tipe 3": "V-shape Criterion",
    "Tipe 4": "Level Criterion",
    "Tipe 5": "Linear Criterion with Indifference",
    "Tipe 6": "Gaussian Criterion",
  };

  constructor(init: {
    kriteria: string[];
    bobotKriteria: Record<string, string>;
    fungsiPreferensi: Record<string, string>;
  }) {
    this.kriteria = init.kriteria;
    this.bobotKriteria = init.bobotKriteria;
    this.fungsiPreferensi = init.fungsiPreferensi;
  }

  StoreALternatives(data: DataAlternatifType[]) {
    this.dataAlternative = data;

    return this;
  }

  // Beta
  TransformAlternative(data: DataAlternatifType) {
    return {
      ...data,
      indek_prestasi_kumulatif: Number(data.indek_prestasi_kumulatif),
      jurusan: this.preferensiJurusan.includes(data.jurusan) ? 1 : 0,
      akreditasi: this.akreditasiScore[data.akreditasi],
    }
  }

  ScoreDifferenceMatrix() {
    const diffMatrix: Record<string, {
      nama: string;
      matrix: {
        nama: string;
        nilai: number;
      }[];
    }[]> = {};
    for (const kriteria of this.kriteria) {
      const key = this.dataAlternativeKey[kriteria];
      const rowDifferenceMatrix: {
        nama: string,
        matrix: {
          nama: string;
          nilai: number;
        }[];
      }[] = [];
      for (let row = 0; row < this.dataAlternative.length; row++) {
        const columnMatrix: { nama: string; nilai: number; }[] = [];
        for (let column = 0; column < this.dataAlternative.length; column++) {
          const transformedColumn = this.TransformAlternative(this.dataAlternative[column]);
          const transformedRow = this.TransformAlternative(this.dataAlternative[row]);

          const nilai = (transformedColumn[key as keyof typeof transformedColumn] as number) - (transformedRow[key as keyof typeof transformedRow] as number);

          columnMatrix.push({
            nama: transformedColumn.nama_lengkap,
            nilai: nilai,
          })
        }

        rowDifferenceMatrix.push({
          nama: this.dataAlternative[row]["nama_lengkap"],
          matrix: columnMatrix
        })
      }

      diffMatrix[kriteria] = rowDifferenceMatrix;
    }

    return diffMatrix;
  }
}