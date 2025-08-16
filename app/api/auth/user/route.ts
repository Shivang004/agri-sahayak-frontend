import { NextRequest, NextResponse } from 'next/server';
import { getDb, releaseClient } from '@/lib/database';

export async function GET(req: NextRequest) {
  let client;
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ message: 'Username is required.' }, { status: 400 });
    }

    client = await getDb();
    const userResult = await client.query('SELECT username, state_id, district_id FROM users WHERE username = $1', [username]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(userResult.rows[0], { status: 200 });
  } catch (error) {
    console.error('Fetch User Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  } finally {
    if (client) {
      releaseClient(client);
    }
  }
}