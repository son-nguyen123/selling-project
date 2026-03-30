import { NextRequest, NextResponse } from 'next/server'

export function GET(request: NextRequest) {
  const url = new URL('/icon-light-32x32.png', request.url)
  return NextResponse.redirect(url, 302)
}
