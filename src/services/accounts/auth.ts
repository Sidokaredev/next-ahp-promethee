'use server';

import { v4 as uuidv4 } from "uuid";
// import { db } from "@/src/databases/mysql/init";
import { tableAdministrator, tablePengguna, tablePeserta } from "@/src/databases/mysql/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { cookies } from "next/headers";
import { AdmSignUpValuesType, SignInValuesType, SignUpValuesType } from "./zod-schema";
import { redirect } from "next/navigation";
import { ServerActionResponse } from "../base";
import { getDB } from "@/src/databases/mysql/init";
/**
 * Type
 */
export type AuthSuccess = {
  message: string;
  as: "peserta" | "administrator";
};
export type TokenPayload = jose.JWTPayload & {
  ID: string;
  id_pengguna: string;
  as: "peserta" | "administrator";
};
/**
 * AuthFn
 */
export async function SignUp(data: SignUpValuesType): Promise<ServerActionResponse<unknown>> {
  try {
    const db = await getDB();
    const check = await db.query.tablePengguna.findFirst({
      columns: {
        email: true
      },
      // with: {
      //   peserta: {
      //     columns: {
      //       nim: true
      //     },
      //   },
      // },
      where: eq(tablePengguna.email, data.email)
    });
    if (check) {
      return {
        response: "error",
        name: "Duplikasi email",
        message: "email telah terdaftar, masuk dengan email tersebut atau daftar dengan email lain",
        cause: `"${data.email}" telah digunakan`,
      }
    }

    const uniqueIdPengguna = uuidv4();
    const uniqueIdPeserta = uuidv4();
    const rounds = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(data.password, rounds);

    await db.transaction(async (tx) => {
      await tx.insert(tablePengguna).values({
        id: uniqueIdPengguna,
        email: data.email,
        password: hashed,
      });
      await tx.insert(tablePeserta).values({
        id: uniqueIdPeserta,
        nama_lengkap: data.nama_lengkap,
        universitas: data.universitas,
        akreditasi: data.akreditasi,
        jurusan: data.jurusan,
        nim: data.nim,
        no_telepon: data.nomor_telepon,
        pengguna_id: uniqueIdPengguna,
      })
    });

    const timeExp = new Date(Date.now() + 6 * 60 * 60 * 1000);
    const secretToken = new Uint8Array(Buffer.from(process.env.SECRET_TOKEN!, "base64"));
    const payload: TokenPayload = {
      ID: uniqueIdPeserta,
      id_pengguna: uniqueIdPengguna,
      as: "peserta",
    };

    const encryptToken = await new jose.EncryptJWT(payload)
      .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
      .setIssuedAt(new Date())
      .setExpirationTime(timeExp)
      .encrypt(secretToken);

    const cookieStore = await cookies();
    cookieStore.set("enc-cre", encryptToken, {
      httpOnly: true,
      expires: timeExp,
      sameSite: "lax"
    });

    return {
      response: "success",
      name: "peserta:pengguna@create",
      message: "Berhasil membuat akun peserta",
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

export async function SignIn(data: SignInValuesType): Promise<ServerActionResponse<"peserta" | "administrator">> {
  try {
    const db = await getDB();
    const check = await db.query.tablePengguna.findFirst({
      columns: {
        id: true,
        email: true,
        password: true,
      },
      where: eq(tablePengguna.email, data.email),
      with: {
        peserta: {
          columns: {
            id: true,
          }
        },
        administrator: {
          columns: {
            id: true
          }
        }
      }
    });
    if (!check) {
      return {
        response: "error",
        name: "Email tidak terdaftar",
        message: `Pengguna dengan email ${data.email} tidak ditemukan`,
        cause: "email yang digunakan tidak terdaftar pada sistem"
      }
    };
    const compare = await bcrypt.compare(data.password, check.password);
    if (!compare) {
      return {
        response: "error",
        name: "Kesalahan password",
        message: "Password yang anda gunakan salah",
        cause: "password tidak sesuai dengan sistem"
      }
    };

    if (!check.administrator && !check.peserta) {
      return {
        response: "error",
        name: "Akun tidak valid",
        message: "Akun yang anda gunakan tidak valid, dan tidak memiliki peranan 'peserta' ataupun 'administrator'",
        cause: "Akun tidak memiliki data 'peserta' maupun 'administrator'"
      }
    }

    let role: "peserta" | "administrator" = "peserta";
    if (check.administrator) {
      role = "administrator";
    };

    const timeExp = new Date(Date.now() + 6 * 60 * 60 * 1000);
    const secretToken = new Uint8Array(Buffer.from(process.env.SECRET_TOKEN!, "base64"));
    const payload: TokenPayload = {
      ID: check.administrator ? check.administrator.id : check.peserta!.id,
      id_pengguna: check.id,
      as: role,
    };

    const encryptToken = await new jose.EncryptJWT(payload)
      .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
      .setIssuedAt(new Date())
      .setExpirationTime(timeExp)
      .encrypt(secretToken);

    const cookieStore = await cookies();
    cookieStore.set("enc-cre", encryptToken, {
      httpOnly: true,
      expires: timeExp,
      sameSite: "lax"
    });

    return {
      response: "data",
      data: role,
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

export async function AdmSignUp(data: AdmSignUpValuesType): Promise<AuthSuccess | Error> {
  try {
    const db = await getDB();
    const check = await db.query.tablePengguna.findFirst({
      columns: {
        email: true
      },
      where: eq(tablePengguna.email, data.email)
    });
    if (check) {
      const err: Error = new Error("email telah terdaftar, masuk dengan email tersebut atau daftar dengan email lain", {
        cause: `"${data.email}" telah digunakan`,
      });
      err.name = "duplikasi email";
      return err;
    }

    const uniqueIdPengguna = uuidv4();
    const uniqueIdAdministrator = uuidv4();
    const rounds = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(data.password, rounds);
    await db.transaction(async (tx) => {
      await tx.insert(tablePengguna).values({
        id: uniqueIdPengguna,
        email: data.email,
        password: hashed,
      });
      await tx.insert(tableAdministrator).values({
        id: uniqueIdAdministrator,
        nama_lengkap: data.nama_lengkap,
        jabatan: data.jabatan,
        pengguna_id: uniqueIdPengguna
      });
    });

    const timeExp = new Date(Date.now() + 1 * 60 * 60 * 1000);
    const secretToken = new Uint8Array(Buffer.from(process.env.SECRET_TOKEN!, "base64"));
    const payload: TokenPayload = {
      ID: uniqueIdAdministrator,
      id_pengguna: uniqueIdPengguna,
      as: "administrator",
    };

    const encryptToken = await new jose.EncryptJWT(payload)
      .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
      .setIssuedAt(new Date())
      .setExpirationTime(timeExp)
      .encrypt(secretToken);

    const cookieStore = await cookies();
    cookieStore.set("enc-cre", encryptToken, {
      httpOnly: true,
      expires: timeExp,
      sameSite: "lax"
    });

    const success: AuthSuccess = {
      message: "berhasil membuat akun",
      as: "peserta",
    }
    return success;
  } catch (err) {
    if (err instanceof Error) {
      return err;
    }

    console.info("unknown errors \t:", err);
    return err as Error;
  }
}

export async function LogOut() {
  const cookieStore = await cookies();
  cookieStore.delete("enc-cre");
  cookieStore.delete("redirect-middleware");

  return redirect("/");
}