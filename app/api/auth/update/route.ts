import { NextRequest, NextResponse } from 'next/server';
import { getDb, releaseClient } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  let client;
  try {
    const { username, password, state_id, district_id } = await req.json();
    client = await getDb();
    const userResult = await client.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Build dynamic update query based on what's provided
    let updateQuery = 'UPDATE users SET ';
    let params: any[] = [];
    let updates: string[] = [];
    let paramIndex = 1;

    if (password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updates.push(`passwordHash = $${paramIndex}`);
      params.push(passwordHash);
      paramIndex++;
    }

    if (state_id !== undefined) {
      updates.push(`state_id = $${paramIndex}`);
      params.push(state_id);
      paramIndex++;
    }

    if (district_id !== undefined) {
      updates.push(`district_id = $${paramIndex}`);
      params.push(district_id);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    updateQuery += updates.join(', ') + ` WHERE username = $${paramIndex}`;
    params.push(username);

    await client.query(updateQuery, params);

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (client) {
      releaseClient(client);
    }
  }
}