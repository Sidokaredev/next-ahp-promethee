import 'dotenv/config';
import { drizzle, MySql2Database } from 'drizzle-orm/mysql2';
import mysql from "mysql2/promise";
import * as schema from "@/src/databases/mysql/schema";

// const connection = await mysql.createConnection({
//   uri: process.env.DATABASE_URL
// });
// export const db = drizzle({
//   client: connection,
//   schema,
//   mode: "default",
// });

let connection: mysql.Connection;
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

    connection = await mysql.createConnection({
      uri: databaseUrl
    });

    dbInstance = drizzle(connection, {
      schema,
      mode: "default"
    });
  }

  return dbInstance;
}
// export const database = drizzle({
//   // use connection pooling if needed only!!!
//   connection: {
//     uri: process.env.DATABASE_URL,
//   },
// });

