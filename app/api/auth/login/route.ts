// File: app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDb, releaseClient } from '@/lib/database'; // Import our new database function
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  let client;
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'Username and password are required.' }, { status: 400 });
    }
    
    // Get the database connection
    client = await getDb();

    // Find the user in the database
    const result = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    // If no user is found, the credentials are invalid
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Compare the provided password with the stored hash
    const passwordMatch = await bcrypt.compare(password, user.passwordhash);

    if (passwordMatch) {
      // If the passwords match, login is successful
      return NextResponse.json({ message: 'Login successful' }, { status: 200 });
    } else {
      // If they don't match, the credentials are invalid
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (client) {
      releaseClient(client);
    }
  }
}