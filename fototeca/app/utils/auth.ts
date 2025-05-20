"use server";
import { cookies } from 'next/headers'

const SECRET_KEY = process.env.AUTH_SECRET_KEY || 'default-secret-key-change-in-production'

export async function setAuthCookie() {
  const token = Buffer.from(`${Date.now()}-${SECRET_KEY}`).toString('base64')
  
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'auth',
    value: token,
    path: '/',
    maxAge: 86400,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  })
  return token
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.set({
    name: 'auth',
    value: '',
    path: '/',
    maxAge: 0
  })
}

export async function verifyAuthToken(token: string): Promise<boolean> {
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