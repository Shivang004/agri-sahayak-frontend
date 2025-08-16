import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { username, password, state_id, district_id } = await req.json();
    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE username = ?', username);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Build dynamic update query based on what's provided
    let updateQuery = 'UPDATE users SET ';
    let params: any[] = [];
    let updates: string[] = [];

    if (password) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      updates.push('passwordHash = ?');
      params.push(passwordHash);
    }

    if (state_id !== undefined) {
      updates.push('state_id = ?');
      params.push(state_id);
    }

    if (district_id !== undefined) {
      updates.push('district_id = ?');
      params.push(district_id);
    }

    if (updates.length === 0) {
      return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    updateQuery += updates.join(', ') + ' WHERE username = ?';
    params.push(username);

    await db.run(updateQuery, ...params);

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}