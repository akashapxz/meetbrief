import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const connectionUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

const sqlHost = process.env.SUPABASE_DB_HOST || process.env.SQL_HOST;
const sqlDbName = process.env.SUPABASE_DB_NAME || process.env.SQL_DB_NAME;
const user = process.env.SUPABASE_DB_USER || process.env.SQL_ADMIN_USER || process.env.SQL_USER;
const password = process.env.SUPABASE_DB_PASSWORD || process.env.SQL_ADMIN_PASSWORD || process.env.SQL_PASSWORD;
const port = parseInt(process.env.SUPABASE_DB_PORT || "5432", 10);

const isSupabase = !!(process.env.SUPABASE_DB_HOST || (sqlHost && sqlHost.includes('supabase')));

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: connectionUrl 
    ? {
        url: connectionUrl,
        ssl: connectionUrl.includes('localhost') || connectionUrl.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
      }
    : {
        host: sqlHost || "localhost",
        port: port,
        user: user || "postgres",
        password: password || "",
        database: sqlDbName || "postgres",
        ssl: isSupabase ? { rejectUnauthorized: false } : false,
      },
  verbose: true,
});
