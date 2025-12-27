import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import type { GetUserResponse } from '@/types/user'

export async function GET() {
  try {
    console.log('[get-user] Starting request...')

    // Get authenticated user from Clerk
    const authResult = await auth()
    console.log('[get-user] Auth result:', authResult ? 'received' : 'null')

    const userId = authResult?.userId
    console.log('[get-user] User ID:', userId || 'none')

    if (!userId) {
      console.log('[get-user] No userId, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[get-user] Fetching user from database...')
    // Fetch user record from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    console.log('[get-user] User found:', user ? 'yes' : 'no')

    // Return user or null if doesn't exist
    const response: GetUserResponse = {
      user: user
        ? {
            id: user.id,
            tipsShown: user.tipsShown as any,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
        : null,
    }

    console.log('[get-user] Returning response')
    return NextResponse.json(response)
  } catch (error) {
    console.error('[get-user] ERROR:', error)
    console.error('[get-user] Error details:', error instanceof Error ? error.message : String(error))
    console.error('[get-user] Error stack:', error instanceof Error ? error.stack : 'no stack')
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
