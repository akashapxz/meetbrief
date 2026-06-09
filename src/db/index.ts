import dotenv from 'dotenv';
dotenv.config();

import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';

// Function to create a new connection pool supporting Supabase and Cloud SQL.
export const createPool = () => {
  const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  if (connectionString) {
    console.log('[DB Config] Connecting using DATABASE_URL connection string.');
    // Enable SSL for cloud hosting providers like Supabase by default
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    return new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
  }

  // Fallback to individual connection parameters
  const host = process.env.SUPABASE_DB_HOST || process.env.SQL_HOST;
  const user = process.env.SUPABASE_DB_USER || process.env.SQL_USER;
  const password = process.env.SUPABASE_DB_PASSWORD || process.env.SQL_PASSWORD;
  const database = process.env.SUPABASE_DB_NAME || process.env.SQL_DB_NAME;
  const portStr = process.env.SUPABASE_DB_PORT || '5432';
  const port = parseInt(portStr, 10);

  const isSupabase = !!(process.env.SUPABASE_DB_HOST || (host && host.includes('supabase')));

  console.log(`[DB Config] Connecting to ${isSupabase ? 'Supabase' : 'SQL'} database on ${host}:${port}`);

  return new Pool({
    host,
    port,
    user,
    password,
    database,
    ssl: isSupabase ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 15000,
  });
};

// Create a pool instance.
export const pool = createPool();

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
});

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });

// Automatic schema bootstrapper for PostgreSQL databases (like Supabase and Cloud SQL)
export const bootstrapSchema = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log('[DB Bootstrap] Checking and bootstrapping database schema...');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create meetings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        duration TEXT NOT NULL,
        transcript TEXT NOT NULL,
        summary TEXT NOT NULL,
        key_topics JSONB NOT NULL,
        decisions JSONB NOT NULL,
        action_items JSONB NOT NULL,
        timeline JSONB NOT NULL,
        sentiment JSONB NOT NULL,
        chat_history JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('[DB Bootstrap] Schema bootstrap completed successfully.');
  } catch (error) {
    console.error('[DB Bootstrap] Schema bootstrap failed:', error);
  } finally {
    if (client) {
      client.release();
    }
  }
};
