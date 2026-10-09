export const PORT = process.env.PORT || 3000;

export const PGUSER = process.env.PGUSER || "postgres";
export const PGHOST = process.env.PGHOST || "localhost";
export const PGPASSWORD = process.env.PGPASSWORD || "postgres";
export const PGDATABASE = process.env.PGDATABASE || "pern_db";
export const PGPORT = process.env.PGPORT ? Number(process.env.PGPORT) : 5432;

// Solo desarrollo: en producción usar un secreto largo desde variable de entorno.
export const SECRET = process.env.SECRET || "mi_secreto_pern_dev";
