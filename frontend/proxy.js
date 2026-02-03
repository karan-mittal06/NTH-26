import { NextResponse } from 'next/server';

export async function proxy(request) {;
  const tokenCookie = request.cookies.get('token')?.value;
  // console.log("token: ",tokenCookie);
  if (!tokenCookie) {
    const url = new URL('/login', request.url);
    url.searchParams.set('unauthenticated', 'true');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/question/:path*'],
};
