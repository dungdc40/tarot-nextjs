# Implementation Tasks

## 1. Database Schema
- [x] 1.1 Create new `User` model in prisma/schema.prisma with fields: id (Clerk userId), tipsShown (Json), createdAt, updatedAt
- [x] 1.2 Add `@@map("users")` to User model for table name
- [x] 1.3 Create Prisma migration for the new User table
- [x] 1.4 Run migration to create User table in database
- [x] 1.5 Add TypeScript type definitions for User model and tip state structure in types/user.ts

## 2. API Endpoint
- [x] 2.1 Create `app/api/user/update-tip-state/route.ts` endpoint
- [x] 2.2 Implement PATCH handler to upsert User record and update tipsShown field
- [x] 2.3 Add authentication check using Clerk to get userId
- [x] 2.4 Add validation for tipType payload
- [x] 2.5 Implement upsert logic (create User if not exists, update if exists)
- [x] 2.6 Handle error cases (unauthenticated, database errors)

## 3. Modal Component
- [x] 3.1 Create `components/reading/FollowupChatTipModal.tsx` component
- [x] 3.2 Design modal with mystical/tarot-themed styling
- [x] 3.3 Implement backdrop overlay with proper z-index
- [x] 3.4 Add "Ok" button with dismiss handler
- [x] 3.5 Ensure accessibility (focus trap, ESC key handler, ARIA labels)
- [x] 3.6 Add smooth fade-in/out animations

## 4. Reading Page Integration
- [x] 4.1 Add state to track if tip should be shown
- [x] 4.2 Implement user message counter for followUps phase
- [x] 4.3 Add useEffect to fetch User record from API on component mount
- [x] 4.4 Check User.tipsShown.followupChatTip flag before showing tip
- [x] 4.5 Trigger tip display after 3rd user message in followUps state (only if not shown before)
- [x] 4.6 Handle tip dismissal and call API to upsert User record
- [x] 4.7 Update local state after successful API call (prevent re-showing in current session)
- [x] 4.8 Handle API errors gracefully (log but don't block user)

## 5. User Data Fetching
- [x] 5.1 Create `app/api/user/get-user/route.ts` endpoint to fetch User record by Clerk userId
- [x] 5.2 Add authentication check in get-user endpoint
- [x] 5.3 Return null or empty tipsShown if User record doesn't exist
- [x] 5.4 Call get-user API from reading page on mount to check tip state

## 6. Type Definitions
- [x] 6.1 Add User interface in types/user.ts with id, tipsShown, createdAt, updatedAt
- [x] 6.2 Add TipsShown interface with followupChatTip boolean field
- [x] 6.3 Add API request/response types for update-tip-state endpoint
- [x] 6.4 Add API response types for get-user endpoint

## 7. Testing
- [x] 7.1 Test tip appears after 3rd followup message for new users
- [x] 7.2 Test tip does NOT appear if already shown (User.tipsShown.followupChatTip is true)
- [x] 7.3 Test tip dismissal creates User record if doesn't exist
- [x] 7.4 Test tip dismissal updates existing User record correctly
- [x] 7.5 Test modal accessibility (keyboard navigation, screen reader)
- [x] 7.6 Test graceful handling of API failures
- [x] 7.7 Test with users who have no User record (lazy initialization)
- [x] 7.8 Test tip state persists across multiple reading sessions
- [x] 7.9 Test across different viewport sizes (responsive design)
