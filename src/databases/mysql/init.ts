import 'dotenv/config';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import mysql from "mysql2/promise";
import * as schema from "@/src/databases/mysql/schema";

let connectionPool: mysql.Pool;
let dbInstance: MySql2Database<typeof schema> & {
  $client: mysql.Connection
};
export async function getDB() {
  if (!dbInstance) {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.error("DATABASE_URL is not set. Database connection will not be established.");
      throw new Error("DATABASE_URL is unset!!!")
    }

    connectionPool = mysql.createPool({
      uri: databaseUrl,
    })

    dbInstance = drizzle({
      client: connectionPool,
      mode: "default",
      schema: schema,
    });
  }

  return dbInstance;
}

