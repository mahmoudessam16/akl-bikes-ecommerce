import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }
    
    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = session.user.email === adminEmail;
    
    return NextResponse.json({ isAdmin }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}

