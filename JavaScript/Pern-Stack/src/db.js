import { Pool } from "pg";
import { PGUSER, PGHOST, PGPASSWORD, PGDATABASE, PGPORT } from "./config.js";

export const pool = new Pool({
  user: PGUSER,
  host: PGHOST,
  password: PGPASSWORD,
  database: PGDATABASE,
  port: PGPORT,
});

pool.on("connect", () => {
  console.log("PostgreSQL connected");
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error", err.message);
});
