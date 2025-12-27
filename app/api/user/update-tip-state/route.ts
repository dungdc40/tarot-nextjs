import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import type { UpdateTipStateRequest, UpdateTipStateResponse } from '@/types/user'

export async function PATCH(request: Request) {
  try {
    // Get authenticated user from Clerk
    const authResult = await auth()
    const userId = authResult?.userId

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse and validate request body
    const body = (await request.json()) as UpdateTipStateRequest

    if (!body.tipType || body.tipType !== 'followupChatTip') {
      return NextResponse.json(
        { error: 'Invalid tipType. Must be "followupChatTip"' },
        { status: 400 }
      )
    }

    // Upsert User record and update tipsShown
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: {
        tipsShown: {
          followupChatTip: true,
        },
      },
      create: {
        id: userId,
        tipsShown: {
          followupChatTip: true,
        },
      },
    })

    const response: UpdateTipStateResponse = {
      success: true,
      message: 'Tip state updated successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to update tip state:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
