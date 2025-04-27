import { relations } from "drizzle-orm";
import { mysqlTable, primaryKey, foreignKey, customType } from "drizzle-orm/mysql-core";
import * as type from "drizzle-orm/mysql-core";
import { Buffer } from "node:buffer";

const timestamps = {
  created_at: type.timestamp().defaultNow(),
  updated_at: type.timestamp(),
}

export const tablePengguna = mysqlTable("pengguna", {
  id: type.varchar({ length: 512 }).primaryKey(),
  email: type.varchar({ length: 128 }).unique().notNull(),
  password: type.varchar({ length: 512 }).notNull(),
  ...timestamps,
});

export const tablePenggunaRelations = relations(tablePengguna, ({ one }) => {
  return {
    peserta: one(tablePeserta),
    administrator: one(tableAdministrator)
  }
});

export const tablePeserta = mysqlTable("peserta", {
  id: type.varchar({ length: 512 }).primaryKey(),
  nama_lengkap: type.varchar({ length: 128 }).notNull(),
  universitas: type.varchar({ length: 128 }).notNull(),
  jurusan: type.varchar({ length: 64 }).notNull(),
  nim: type.varchar({ length: 32 }).notNull(),
  akreditasi: type.mysqlEnum(["A", "B", "C", "Tidak Terakreditasi"]).notNull(),
  no_telepon: type.bigint({ mode: "number", unsigned: true }).notNull(),
  pengguna_id: type.varchar({ length: 512 }).notNull(),

  ...timestamps,
}, (table) => [
  foreignKey({
    columns: [table.pengguna_id],
    foreignColumns: [tablePengguna.id],
    name: "fk_peserta_pengguna"
  })
]);

export const tablePesertaRelations = relations(tablePeserta, ({ one, many }) => {
  return {
    pengguna: one(tablePengguna, {
      fields: [tablePeserta.pengguna_id],
      references: [tablePengguna.id]
    }),
    pendaftar: many(tablePendaftar)
  }
});

export const tableAdministrator = mysqlTable("administrator", {
  id: type.varchar({ length: 512 }).primaryKey(),
  nama_lengkap: type.varchar({ length: 128 }).notNull(),
  jabatan: type.varchar({ length: 64 }).notNull(),
  pengguna_id: type.varchar({ length: 512 }).notNull(),
  ...timestamps,
}, (table) => [
  foreignKey({
    columns: [table.pengguna_id],
    foreignColumns: [tablePengguna.id],
    name: "fk_administrator_pengguna"
  })
]);

export const tableAdministratorRelations = relations(tableAdministrator, ({ one }) => {
  return {
    pengguna: one(tablePengguna, {
      fields: [tableAdministrator.pengguna_id],
      references: [tablePengguna.id]
    })
  }
})


const blob = (size: "BLOB" | "MEDIUMBLOB" | "LONGBLOB") => customType<{
  data: Buffer
}>({
  dataType() {
    return size
  }
})

export const tableDokumen = mysqlTable("dokumen", {
  id: type.bigint({ mode: "number" }).primaryKey().autoincrement(),
  tujuan_dokumen: type.varchar({ length: 512 }).notNull(),
  origin_name: type.varchar({ length: 256 }).notNull(),
  mime_type: type.varchar({ length: 32 }).notNull(),
  size: type.int().notNull(),
  blob: blob("MEDIUMBLOB")('binary').notNull(),
  ...timestamps,
});

export const tableDokumenRelations = relations(tableDokumen, ({ one }) => {
  return {
    pendaftar: one(tablePendaftar)
  }
})

export const tablePeriodeSeleksi = mysqlTable("periode_seleksi", {
  id: type.bigint({ mode: "number" }).primaryKey().autoincrement(),
  nama: type.varchar({ length: 128 }).notNull(),
  deskripsi: type.text(),
  tanggal_dibuka: type.datetime().notNull(),
  batas_pendaftaran: type.datetime().notNull(),
  total_pendaftar: type.int().default(0),
  total_diterima: type.int().default(0),
  status: type.varchar({ length: 16 }).default("berlangsung"),
  ...timestamps,
});

export const tablePeriodeSeleksiRelations = relations(tablePeriodeSeleksi, ({ many }) => {
  return {
    pendaftar: many(tablePendaftar),
  }
});

export const tablePendaftar = mysqlTable("pendaftar", {
  id: type.bigint({ mode: "number" }).primaryKey().autoincrement(),
  indek_prestasi_kumulatif: type.decimal({ precision: 3, scale: 2 }).notNull(),
  semester: type.int().notNull(),
  status: type.mysqlEnum(["diproses", "diterima"]).notNull(),
  periode_seleksi_id: type.bigint({ mode: "number" }).notNull(),
  peserta_id: type.varchar({ length: 512 }).notNull(),
  sp_universitas_id: type.bigint({ mode: "number" }).notNull(),
  sp_bakesbangpol_provinsi_id: type.bigint({ mode: "number" }).notNull(),
  sp_bakesbangpol_daerah_id: type.bigint({ mode: "number" }).notNull(),
  ...timestamps,
}, (table) => [
  foreignKey({
    columns: [table.periode_seleksi_id],
    foreignColumns: [tablePeriodeSeleksi.id],
    name: "fk_pendaftar_periode_seleksi"
  }),
  foreignKey({
    columns: [table.peserta_id],
    foreignColumns: [tablePeserta.id],
    name: "fk_pendaftar_peserta"
  }),
  foreignKey({
    columns: [table.sp_universitas_id],
    foreignColumns: [tableDokumen.id],
    name: "fk_universitas_dokumen"
  }),
  foreignKey({
    columns: [table.sp_bakesbangpol_provinsi_id],
    foreignColumns: [tableDokumen.id],
    name: "fk_bakesbangpol_provinsi_dokumen"
  }),
  foreignKey({
    columns: [table.sp_bakesbangpol_daerah_id],
    foreignColumns: [tableDokumen.id],
    name: "fk_bakesbangpol_daerah_dokumen"
  })
]);

export const tablePendaftarRelations = relations(tablePendaftar, ({ one }) => {
  return {
    periode_seleksi: one(tablePeriodeSeleksi, {
      fields: [tablePendaftar.periode_seleksi_id],
      references: [tablePeriodeSeleksi.id]
    }),
    peserta: one(tablePeserta, {
      fields: [tablePendaftar.peserta_id],
      references: [tablePeserta.id]
    }),
    sp_universitas: one(tableDokumen, {
      fields: [tablePendaftar.sp_universitas_id],
      references: [tableDokumen.id]
    }),
    sp_bakesbangpol_provinsi: one(tableDokumen, {
      fields: [tablePendaftar.sp_bakesbangpol_provinsi_id],
      references: [tableDokumen.id]
    }),
    sp_bakesbangpol_daerah: one(tableDokumen, {
      fields: [tablePendaftar.sp_bakesbangpol_daerah_id],
      references: [tableDokumen.id]
    })
  }
});

// export const kriteria = mysqlTable("kriteria", {
//   id: type.int().primaryKey().autoincrement(),
//   nama: type.varchar({ length: 64 }).notNull(),
//   ...timestamps,
// })

// export const kriteriaPeriodeSeleksi = mysqlTable("kriteria_periode_seleksi", {
//   kriteria_id: type.int().notNull(),
//   periode_seleksi_id: type.bigint({ mode: "number" }).notNull(),
// }, (table) => [
//   primaryKey({ name: "composite_kriteria_periode_seleksi", columns: [table.kriteria_id, table.periode_seleksi_id] }),
//   foreignKey({
//     columns: [table.kriteria_id],
//     foreignColumns: [kriteria.id],
//     name: "m2m_fk_kriteria",
//   }),
//   foreignKey({
//     columns: [table.periode_seleksi_id],
//     foreignColumns: [tablePeriodeSeleksi.id],
//     name: "m2m_fk_periode_seleksi"
//   })
// ]);

// export const skalaPerbandingan = mysqlTable("skala_perbandingan", {
//   id: type.int().primaryKey().autoincrement(),
//   matrix_ref: type.varchar({ length: 256 }).notNull(),
//   nilai: type.decimal({ precision: 6, scale: 5 }).notNull(),
//   periode_seleksi_id: type.bigint({ mode: "number" }).notNull(),
//   ...timestamps
// }, (table) => [
//   foreignKey({
//     columns: [table.periode_seleksi_id],
//     foreignColumns: [tablePeriodeSeleksi.id],
//     name: "fk_skala_perbandingan_periode_seleksi"
//   })
// ]);

