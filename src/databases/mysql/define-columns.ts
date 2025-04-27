import { tablePendaftar, tablePeriodeSeleksi, tablePeserta } from "./schema";

export const tablePesertaColumns = {
  id: tablePeserta.id,
  nama_lengkap: tablePeserta.nama_lengkap,
  universitas: tablePeserta.universitas,
  akreditasi: tablePeserta.akreditasi,
  jurusan: tablePeserta.jurusan,
  nim: tablePeserta.nim,
  no_telepon: tablePeserta.no_telepon,
  pengguna_id: tablePeserta.pengguna_id,
  created_at: tablePeserta.created_at,
  updated_at: tablePeserta.updated_at,
}

export const tablePeriodeSeleksiColumns = {
  id: tablePeriodeSeleksi.id,
  nama: tablePeriodeSeleksi.nama,
  deskripsi: tablePeriodeSeleksi.deskripsi,
  tanggal_dibuka: tablePeriodeSeleksi.tanggal_dibuka,
  batas_pendaftaran: tablePeriodeSeleksi.batas_pendaftaran,
  total_pendaftar: tablePeriodeSeleksi.total_pendaftar,
  total_diterima: tablePeriodeSeleksi.total_diterima,
  status: tablePeriodeSeleksi.status,
  created_at: tablePeriodeSeleksi.created_at,
  updated_at: tablePeriodeSeleksi.updated_at,
}

export const tablePendaftarColumns = {
  id: tablePendaftar.id,
  indek_prestasi_kumulatif: tablePendaftar.indek_prestasi_kumulatif,
  semester: tablePendaftar.semester,
  status: tablePendaftar.status,
  periode_seleksi_id: tablePendaftar.periode_seleksi_id,
  peserta_id: tablePendaftar.peserta_id,
  sp_universitas_id: tablePendaftar.sp_universitas_id,
  sp_bakesbangpol_provinsi_id: tablePendaftar.sp_bakesbangpol_provinsi_id,
  sp_bakesbangpol_daerah_id: tablePendaftar.sp_bakesbangpol_daerah_id,
  created_at: tablePendaftar.created_at,
  updated_at: tablePendaftar.updated_at,
}