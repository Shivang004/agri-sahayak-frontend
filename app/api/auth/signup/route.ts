import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database'; // Import our new database function
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { username, password, state_id, district_id } = await req.json();

    if (!username || !password || state_id === undefined || district_id === undefined) {
      return NextResponse.json({ message: 'Username, password, state_id, and district_id are required.' }, { status: 400 });
    }

    // Get the database connection
    const db = await getDb();

    // Check if the user already exists in the database
    const userExists = await db.get('SELECT * FROM users WHERE username = ?', username);

    if (userExists) {
      return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
    }

    // Hash the password for security
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert the new user into the database
    await db.run('INSERT INTO users (username, passwordHash, state_id, district_id) VALUES (?, ?, ?, ?)', username, passwordHash, state_id, district_id);

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}