import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from "mysql2/promise";
import * as schema from "@/src/databases/mysql/schema";

const connection = await mysql.createConnection({
  uri: process.env.DATABASE_URL
});
export const db = drizzle({
  client: connection,
  schema,
  mode: "default",
});
// export const database = drizzle({
//   // use connection pooling if needed only!!!
//   connection: {
//     uri: process.env.DATABASE_URL,
//   },
// });

