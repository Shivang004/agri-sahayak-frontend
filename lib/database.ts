import { Pool, PoolClient } from 'pg';
import bcrypt from 'bcryptjs';

// This variable will hold our database connection pool.
let pool: Pool | null = null;

// Flag to track if we're in fallback mode
let fallbackMode = false;

/**
 * This function connects to the PostgreSQL database, creates the 'users' table 
 * if it doesn't exist, and adds a default admin user for the first run.
 */
export async function getDb(): Promise<PoolClient> {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️  DATABASE_URL not set. Running in fallback mode. ' +
        'Create a .env.local file with DATABASE_URL=postgresql://username:password@localhost:5432/agri_sahayak'
      );
      fallbackMode = true;
      throw new Error('DATABASE_URL not configured. Please set up PostgreSQL connection.');
    } else {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Please create a .env.local file with DATABASE_URL=postgresql://username:password@localhost:5432/agri_sahayak ' +
        'or set it in your environment variables.'
      );
    }
  }

  // If the connection pool already exists, get a client from it.
  if (pool) {
    return pool.connect();
  }

  try {
    // Create a new connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    // Test the connection
    const testClient = await pool.connect();
    await testClient.query('SELECT NOW()');
    testClient.release();

    console.log('PostgreSQL connection pool created successfully');
  } catch (error) {
    console.error('Failed to create PostgreSQL connection pool:', error);
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '⚠️  PostgreSQL connection failed. Running in fallback mode. ' +
        'Please check your DATABASE_URL and ensure PostgreSQL is running.'
      );
      fallbackMode = true;
      throw new Error('PostgreSQL connection failed. Please check your configuration.');
    } else {
      throw new Error(
        `Failed to connect to PostgreSQL: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        'Please check your DATABASE_URL and ensure PostgreSQL is running.'
      );
    }
  }

  // Get a client from the pool
  const client = await pool.connect();

  try {
    // Create the 'users' table if it's not already there with the initial schema.
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        passwordHash TEXT
      )
    `);

    // Check for the 'state_id' column to see if migrations are needed.
    const columnsResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'state_id'
    `);
    const hasStateIdColumn = columnsResult.rows.length > 0;

    // If the column doesn't exist, alter the table to add the new columns.
    if (!hasStateIdColumn) {
      console.log("Updating database schema: adding 'state_id' and 'district_id' columns.");
      await client.query("ALTER TABLE users ADD COLUMN state_id INTEGER");
      await client.query("ALTER TABLE users ADD COLUMN district_id INTEGER");
    }

    // For convenience, let's add a default admin user if the table is empty.
    const userCountResult = await client.query('SELECT COUNT(*) as count FROM users');
    if (parseInt(userCountResult.rows[0].count) === 0) {
      const saltRounds = 10;
      const adminPasswordHash = await bcrypt.hash('password', saltRounds);
      await client.query(
        'INSERT INTO users (username, passwordHash, state_id, district_id) VALUES ($1, $2, $3, $4)', 
        ['admin', adminPasswordHash, 8, 104]
      ); // Uttar Pradesh (8), Kanpur Nagar (104)
      console.log('Default admin user created with username "admin" and password "password"');
    }

    return client;
  } catch (error) {
    client.release();
    throw error;
  }
}

// Helper function to release a client back to the pool
export function releaseClient(client: PoolClient) {
  if (client && !fallbackMode) {
    client.release();
  }
}

// Helper function to close the pool (useful for cleanup)
export async function closePool() {
  if (pool && !fallbackMode) {
    await pool.end();
    pool = null;
  }
}

// Helper function to check if we're in fallback mode
export function isFallbackMode(): boolean {
  return fallbackMode;
}