import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Temporarily disabled - just pass through
  return NextResponse.next()
}

export const config = {
  matcher: [], // Empty matcher = disabled
}