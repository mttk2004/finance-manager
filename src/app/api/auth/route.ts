import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    // So sánh với biến môi trường
    if (password === process.env.APP_PASSWORD) {
      const response = NextResponse.json({ success: true });

      // Cấp HTTPOnly Cookie, thời hạn 30 ngày
      response.cookies.set('auth_status', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30, 
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Mật khẩu không chính xác' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Đã có lỗi xảy ra' }, { status: 500 });
  }
}
