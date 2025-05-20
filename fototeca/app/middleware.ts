import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SECRET_KEY = process.env.AUTH_SECRET_KEY || 'default-secret-key-change-in-production'

async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const [timestamp, key] = decoded.split('-')
    
    const tokenAge = Date.now() - parseInt(timestamp)
    if (tokenAge > 24 * 60 * 60 * 1000) {
      return false
    }
    
    return key === SECRET_KEY
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth')
  
  if (request.nextUrl.pathname.startsWith('/fototeca')) {
    if (!authCookie?.value || !(await verifyAuthToken(authCookie.value))) {
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('auth')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/fototeca/:path*'],
} 