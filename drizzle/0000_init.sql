CREATE TABLE `administrator` (
	`id` varchar(512) NOT NULL,
	`nama_lengkap` varchar(128) NOT NULL,
	`jabatan` varchar(64) NOT NULL,
	`pengguna_id` varchar(512) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `administrator_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bidang_ilmu` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama` varchar(512) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `bidang_ilmu_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bobot_kriteria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nilai` decimal(4,3) NOT NULL,
	`kriteria_id` int NOT NULL,
	`periode_seleksi_id` bigint NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `bobot_kriteria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dokumen` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`tujuan_dokumen` varchar(512) NOT NULL,
	`origin_name` varchar(256) NOT NULL,
	`mime_type` varchar(32) NOT NULL,
	`size` int NOT NULL,
	`binary` MEDIUMBLOB NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `dokumen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fungsi_preferensi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipe` varchar(256) NOT NULL,
	`q` decimal(4,2),
	`p` decimal(4,2),
	`s` decimal(4,2),
	`kriteria_id` int NOT NULL,
	`periode_seleksi_id` bigint NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `fungsi_preferensi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kriteria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama` varchar(512) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `kriteria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pendaftar` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`indek_prestasi_kumulatif` decimal(3,2) NOT NULL,
	`semester` int NOT NULL,
	`status` enum('diproses','diterima') NOT NULL,
	`periode_seleksi_id` bigint NOT NULL,
	`peserta_id` varchar(512) NOT NULL,
	`sp_universitas_id` bigint NOT NULL,
	`sp_bakesbangpol_provinsi_id` bigint NOT NULL,
	`sp_bakesbangpol_daerah_id` bigint NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `pendaftar_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pengguna` (
	`id` varchar(512) NOT NULL,
	`email` varchar(128) NOT NULL,
	`password` varchar(512) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `pengguna_id` PRIMARY KEY(`id`),
	CONSTRAINT `pengguna_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `periode_seleksi` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`nama` varchar(128) NOT NULL,
	`deskripsi` text,
	`tanggal_dibuka` datetime NOT NULL,
	`batas_pendaftaran` datetime NOT NULL,
	`total_pendaftar` int DEFAULT 0,
	`total_diterima` int DEFAULT 0,
	`status` varchar(16) DEFAULT 'berlangsung',
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `periode_seleksi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `peserta` (
	`id` varchar(512) NOT NULL,
	`nama_lengkap` varchar(128) NOT NULL,
	`universitas` varchar(128) NOT NULL,
	`jurusan` varchar(64) NOT NULL,
	`nim` varchar(32) NOT NULL,
	`akreditasi` enum('A','B','C','Tidak Terakreditasi') NOT NULL,
	`no_telepon` bigint unsigned NOT NULL,
	`pengguna_id` varchar(512) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `peserta_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `program_studi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama` varchar(1024) NOT NULL,
	`bidang_ilmu_id` int NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `program_studi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skala_perbandingan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`matrix_ref` varchar(256) NOT NULL,
	`nilai` decimal(6,5) NOT NULL,
	`periode_seleksi_id` bigint NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `skala_perbandingan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skor_program_studi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`skor` int NOT NULL,
	`program_studi_id` int NOT NULL,
	`periode_seleksi_id` bigint NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `skor_program_studi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `administrator` ADD CONSTRAINT `fk_administrator_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bobot_kriteria` ADD CONSTRAINT `fk_bobot_kriteria` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bobot_kriteria` ADD CONSTRAINT `fk_bobot_periode_seleksi` FOREIGN KEY (`periode_seleksi_id`) REFERENCES `periode_seleksi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fungsi_preferensi` ADD CONSTRAINT `fk_fungsi_preferensi_kriteria` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fungsi_preferensi` ADD CONSTRAINT `fk_fungsi_preferensi_periode_seleksi` FOREIGN KEY (`periode_seleksi_id`) REFERENCES `periode_seleksi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pendaftar` ADD CONSTRAINT `fk_pendaftar_periode_seleksi` FOREIGN KEY (`periode_seleksi_id`) REFERENCES `periode_seleksi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pendaftar` ADD CONSTRAINT `fk_pendaftar_peserta` FOREIGN KEY (`peserta_id`) REFERENCES `peserta`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pendaftar` ADD CONSTRAINT `fk_universitas_dokumen` FOREIGN KEY (`sp_universitas_id`) REFERENCES `dokumen`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pendaftar` ADD CONSTRAINT `fk_bakesbangpol_provinsi_dokumen` FOREIGN KEY (`sp_bakesbangpol_provinsi_id`) REFERENCES `dokumen`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `pendaftar` ADD CONSTRAINT `fk_bakesbangpol_daerah_dokumen` FOREIGN KEY (`sp_bakesbangpol_daerah_id`) REFERENCES `dokumen`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `peserta` ADD CONSTRAINT `fk_peserta_pengguna` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `program_studi` ADD CONSTRAINT `fk_program_studi_bidang_ilmu` FOREIGN KEY (`bidang_ilmu_id`) REFERENCES `bidang_ilmu`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `skala_perbandingan` ADD CONSTRAINT `fk_skala_perbandingan_periode_seleksi` FOREIGN KEY (`periode_seleksi_id`) REFERENCES `periode_seleksi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `skor_program_studi` ADD CONSTRAINT `fk_skor_program_studi_program_studi` FOREIGN KEY (`program_studi_id`) REFERENCES `program_studi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `skor_program_studi` ADD CONSTRAINT `fk_skor_program_studi_periode_seleksi` FOREIGN KEY (`periode_seleksi_id`) REFERENCES `periode_seleksi`(`id`) ON DELETE no action ON UPDATE no action;