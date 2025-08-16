import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import bcrypt from 'bcryptjs';

// This variable will hold our database connection.
let db: Database | null = null;

/**
 * This function connects to the SQLite database, creates the 'users' table 
 * if it doesn't exist, and adds a default admin user for the first run.
 */
export async function getDb() {
  // If the connection already exists, return it to avoid re-opening it.
  if (db) {
    return db;
  }

  // Open a connection to the database file.
  // The file will be created if it doesn't exist.
  const newDb = await open({
    filename: './agri-sahayak.sqlite', // This file will be created in your project's root folder.
    driver: sqlite3.Database,
  });

  // Create the 'users' table if it's not already there with the initial schema.
  await newDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      passwordHash TEXT
    )
  `);

  // Check for the 'state_id' column to see if migrations are needed.
  const columns = await newDb.all("PRAGMA table_info(users)");
  const hasStateIdColumn = columns.some(col => col.name === 'state_id');

  // If the column doesn't exist, alter the table to add the new columns.
  if (!hasStateIdColumn) {
    console.log("Updating database schema: adding 'state_id' and 'district_id' columns.");
    await newDb.exec("ALTER TABLE users ADD COLUMN state_id INTEGER");
    await newDb.exec("ALTER TABLE users ADD COLUMN district_id INTEGER");
  }

  // For convenience, let's add a default admin user if the table is empty.
  const userCount = await newDb.get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash('password', saltRounds);
    await newDb.run('INSERT INTO users (username, passwordHash, state_id, district_id) VALUES (?, ?, ?, ?)', 
      'admin', adminPasswordHash, 8, 104); // Uttar Pradesh (8), Kanpur Nagar (104)
    console.log('Default admin user created with password "password"');
  }

  db = newDb;
  return db;
}