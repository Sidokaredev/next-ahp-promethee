'use server';

import { db } from "@/src/databases/mysql/init";
import { tablePeserta } from "@/src/databases/mysql/schema";
import { eq } from "drizzle-orm";
import * as jose from "jose";
import { cookies } from "next/headers";
import { TokenPayload } from "../accounts/auth";
import { ServerActionResponse } from "../base";
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
  }): Promise<ServerActionResponse<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("enc-cre");
  if (!token) {
    return {
      response: "error",
      name: "Token invalid",
      message: "Sesi anda pada sistem telah habis, silahkan masuk kembali",
      cause: "Token pengguna tidak ditemukan atau rusak",
    }
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
      return {
        response: "error",
        name: "Data tidak ditemukan",
        message: `Data peserta dengan id [${ID}] tidak dapat ditemukan`,
        cause: "Data peserta tidak ditemukan atau id tidak valid"
      }
    }

    return {
      response: "data",
      data: profiles as T,
    };
  } catch (err) {
    const catchedErr = err as Error;
    console.log("unknown err\t:", err);
    return {
      response: "error",
      name: catchedErr.name,
      message: catchedErr.message,
      cause: catchedErr.cause as string,
    }
  }
}

export async function ChangeProfilePeserta(data: ProfilePesertaType): Promise<ServerActionResponse<unknown>> {
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
      response: "success",
      name: "peserta:profile-peserta@change",
      message: "Berhasil mengubah data profile",
    }
  } catch (err) {
    const catchedErr = err as Error;
    console.log("unknown err\t:", err);
    return {
      response: "error",
      name: catchedErr.name,
      message: catchedErr.message,
      cause: catchedErr.cause as string,
    }
  }
}