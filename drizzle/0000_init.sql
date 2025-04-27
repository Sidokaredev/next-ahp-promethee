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
CREATE TABLE `dokumen` (
	`id` bigint unsigned AUTO_INCREMENT NOT NULL,
	`tujuan_dokumen` varchar(64) NOT NULL,
	`origin_name` varchar(256) NOT NULL,
	`mime_type` varchar(32) NOT NULL,
	`size` int NOT NULL,
	`binary` MEDIUMBLOB NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `dokumen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kriteria` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama` varchar(64) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `kriteria_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `kriteria_periode_seleksi` (
	`kriteria_id` int NOT NULL,
	`periode_seleksi_id` bigint NOT NULL,
	CONSTRAINT `composite_kriteria_periode_seleksi` PRIMARY KEY(`kriteria_id`,`periode_seleksi_id`)
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
	`tanggal_pendaftaran` varchar(128) NOT NULL,
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
	`no_telepon` bigint unsigned NOT NULL,
	`pengguna_id` varchar(512) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `peserta_id` PRIMARY KEY(`id`)
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
ALTER TABLE `administrator` ADD CONSTRAINT `administrator_pengguna_id_pengguna_id_fk` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kriteria_periode_seleksi` ADD CONSTRAINT `m2m_fk_kriteria` FOREIGN KEY (`kriteria_id`) REFERENCES `kriteria`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `kriteria_periode_seleksi` ADD CONSTRAINT `m2m_fk_periode_seleksi` FOREIGN KEY (`periode_seleksi_id`) REFERENCES `periode_seleksi`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `peserta` ADD CONSTRAINT `peserta_pengguna_id_pengguna_id_fk` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `skala_perbandingan` ADD CONSTRAINT `fk_skala_perbandingan_periode_seleksi` FOREIGN KEY (`periode_seleksi_id`) REFERENCES `periode_seleksi`(`id`) ON DELETE no action ON UPDATE no action;