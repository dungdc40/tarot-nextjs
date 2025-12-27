// User and Tip State Types

export interface TipsShown {
  followupChatTip?: boolean
  // Future tips can be added here without schema migration
}

export interface User {
  id: string // Clerk user ID
  tipsShown: TipsShown | null
  createdAt: Date
  updatedAt: Date
}

// API Types
export interface UpdateTipStateRequest {
  tipType: 'followupChatTip'
}

export interface UpdateTipStateResponse {
  success: boolean
  message?: string
}

export interface GetUserResponse {
  user: User | null
}
