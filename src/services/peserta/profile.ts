'use server';

import { db } from "@/src/databases/mysql/init";
import { tablePeserta } from "@/src/databases/mysql/schema";
import { eq } from "drizzle-orm";
import * as jose from "jose";
import { cookies } from "next/headers";
import { TokenPayload } from "../accounts/auth";
/**
 * Type
 */
export type PesertaSuccess = {
  name: string;
  message: string;
};

export type ProfilePesertaType = {
  id: string;
  nama_lengkap: string;
  universitas: string;
  akreditasi: "A" | "B" | "C" | "Tidak Terakreditasi",
  jurusan: string;
  nim: string;
  no_telepon: number;
  pengguna: {
    email: string;
  };
};
/**
 * PesertaFn
 */
export async function GetProfilePeserta<T>(options: {
  columns: object;
  relations: object;
} = {
    columns: {
      id: true,
      nama_lengkap: true,
      universitas: true,
      akreditasi: true,
      jurusan: true,
      nim: true,
      no_telepon: true,
    },
    relations: {
      pengguna: {
        columns: {
          email: true
        }
      }
    },
  }): Promise<T | Error> {
  const cookieStore = await cookies();
  const token = cookieStore.get("enc-cre");
  if (!token) {
    const err = new Error(
      "Sesi anda pada sistem telah habis, silahkan masuk kembali",
      { cause: "token pengguna tidak ditemukan" }
    );
    err.name = "token invalid";

    return err;
  }

  const secretToken = new Uint8Array(Buffer.from(process.env.SECRET_TOKEN!, "base64"));
  try {
    const { payload } = await jose.jwtDecrypt(token.value, secretToken);
    const { ID } = payload as TokenPayload;
    const profiles = await db.query.tablePeserta.findFirst({
      columns: { ...options.columns },
      where: eq(tablePeserta.id, ID),
      with: { ...options.relations }
    });
    if (!profiles) {
      const err = new Error(
        `Data peserta dengan id [${ID}] tidak dapat ditemukan`,
        { cause: "data peserta tidak ditemukan atau id tidak valid" }
      );
      err.name = "data tidak ditemukan";

      return err;
    }

    return profiles as T;
  } catch (err) {
    if (err instanceof Error) {
      return err;
    }

    console.log("unknown err\t:", err);
    return err as Error;
  }
}

export async function ChangeProfilePeserta(data: ProfilePesertaType): Promise<PesertaSuccess | Error> {
  try {
    await db.update(tablePeserta).set({
      nama_lengkap: data.nama_lengkap,
      universitas: data.universitas,
      akreditasi: data.akreditasi,
      jurusan: data.jurusan,
      nim: data.nim,
      no_telepon: data.no_telepon // ERROR
    }).where(eq(tablePeserta.id, data.id));

    return {
      name: "peserta:profile-peserta@change",
      message: "Berhasil mengubah data profile",
    }
  } catch (err) {
    console.log("unknown err\t:", err);
    return err as Error;
  }
}