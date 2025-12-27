# Environment Variables Setup

## Current Configuration ✅

The `.env.local` file has been created with all required variables for Phase 2.

---

## Environment Variables

### OpenAI Configuration

```bash
OPENAI_API_KEY=sk-dummy-api-key-replace-with-real-key
OPENAI_BASE_URL=https://api.openai.com/v1
```

**What you need to do:**
1. Sign up at https://platform.openai.com
2. Create an API key in your OpenAI dashboard
3. Replace `sk-dummy-api-key-replace-with-real-key` with your actual API key

---

### OpenAI Prompt IDs

```bash
OPENAI_PROMPT_INTENT_ID=prompt-intent-dummy-id-12345
OPENAI_PROMPT_SPREAD_ID=prompt-spread-dummy-id-67890
OPENAI_PROMPT_READING_ID=prompt-reading-dummy-id-abcde
OPENAI_PROMPT_EXPLANATION_ID=prompt-explanation-dummy-id-fghij
OPENAI_PROMPT_CLARIFICATION_ID=prompt-clarification-dummy-id-klmno
```

**What these are:**
These are OpenAI Prompt IDs that contain the system prompts for each AI feature:
- `OPENAI_PROMPT_INTENT_ID` - Assesses user's intention clarity
- `OPENAI_PROMPT_SPREAD_ID` - Generates tarot spread configuration
- `OPENAI_PROMPT_READING_ID` - Generates the full reading interpretation
- `OPENAI_PROMPT_EXPLANATION_ID` - Explains highlighted text ("Why?" feature)
- `OPENAI_PROMPT_CLARIFICATION_ID` - Handles follow-up questions

**What you need to do:**
1. You'll need to create these prompts in your OpenAI account
2. Or you can use the Chat Completions API without prompt IDs (requires code modification)

**For now:** The dummy IDs will work for development if you don't call the AI features yet.

---

### Database Configuration

```bash
DATABASE_URL="postgresql://localhost:5432/tarot"
```

**What you need to do:**

#### Option 1: Local PostgreSQL (Recommended for Development)
```bash
# Install PostgreSQL
sudo apt install postgresql  # Ubuntu/Debian
brew install postgresql       # macOS

# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql # macOS

# Create database
createdb tarot

# Push Prisma schema to database
npx prisma db push

# (Optional) Open Prisma Studio to browse data
npx prisma studio
```

#### Option 2: Supabase (Free Cloud Database)
1. Sign up at https://supabase.com
2. Create a new project
3. Go to Settings > Database > Connection String
4. Copy the connection string
5. Replace in `.env.local`:
   ```bash
   DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
   ```
6. Run: `npx prisma db push`

#### Option 3: Other Providers
- **Railway**: https://railway.app (Free tier available)
- **Neon**: https://neon.tech (Serverless PostgreSQL, free tier)
- **DigitalOcean**: Managed PostgreSQL (~$15/month)

---

### OpenAI Voice Reading Mode Configuration (Optional)

```bash
OPENAI_VOICE_ENABLED=false
VOICE_TOKEN_TTL=60
VOICE_MAX_SESSION_DURATION=1800
```

**What these are:**
- `OPENAI_VOICE_ENABLED` - Enables/disables voice reading mode feature
- `VOICE_TOKEN_TTL` - Time-to-live for ephemeral tokens in seconds (default: 60)
- `VOICE_MAX_SESSION_DURATION` - Maximum session duration in seconds (default: 1800 = 30 minutes)

**What you need to do:**
1. Voice mode requires OpenAI Realtime API access
2. Set `OPENAI_VOICE_ENABLED=true` to enable the feature
3. Ensure `OPENAI_API_KEY` has access to Realtime API
4. Voice mode will appear as an option on the reading page when enabled

**Browser Requirements:**
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- HTTPS connection (or localhost for development)
- Microphone permission granted

**Cost Considerations:**
- Voice mode uses OpenAI's Realtime API (`gpt-4o-realtime-preview`)
- Charged per audio minute of connection time
- Recommended to monitor usage and set appropriate `VOICE_MAX_SESSION_DURATION`

**For now:** Voice mode is disabled by default. Text-based reading mode works independently.

---

### Next.js Configuration

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

These are set correctly for local development. No changes needed.

---

## File Security ✅

The `.env.local` file is already protected:
- ✅ Listed in `.gitignore` (won't be committed to Git)
- ✅ Separate from `.env.local.example` (which CAN be committed)

**Important:**
- Never commit `.env.local` to Git
- Never share your API keys publicly
- Use different API keys for development and production

---

## Testing Your Setup

### 1. Test Environment Variables Are Loaded
```bash
# The server should show:
# "Reload env: .env.local"
#
# Check the server logs to confirm it reloaded
```

### 2. Test Database Connection
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio
# Opens at http://localhost:5555
```

### 3. Test API Routes (After Setting Real API Key)
```bash
# Test assess-intent endpoint
curl -X POST http://localhost:3000/api/ai/assess-intent \
  -H "Content-Type: application/json" \
  -d '{"userMessage": "I need guidance about my career"}'

# Expected response (with real API key):
# {
#   "status": "clear" | "unclear",
#   "intention": "...",
#   "responseId": "..."
# }
```

---

## Current Status

| Variable | Status | Action Required |
|----------|--------|-----------------|
| `OPENAI_API_KEY` | ⚠️ Dummy | Replace with real API key |
| `OPENAI_BASE_URL` | ✅ Set | No action needed |
| `OPENAI_PROMPT_*_ID` (5 vars) | ⚠️ Dummy | Create prompts in OpenAI |
| `OPENAI_VOICE_ENABLED` | ✅ Set (disabled) | Set to `true` to enable voice mode (optional) |
| `VOICE_TOKEN_TTL` | ✅ Set | No action needed |
| `VOICE_MAX_SESSION_DURATION` | ✅ Set | No action needed |
| `DATABASE_URL` | ⚠️ Points to local | Set up PostgreSQL database |
| `NEXT_PUBLIC_APP_URL` | ✅ Set | No action needed |
| `NODE_ENV` | ✅ Set | No action needed |

---

## Next Steps

### For Development (Continue Migration)
You can continue with Phase 3 (UI Features) without real API keys:
- Deck Browser works without any API calls
- Reading Flow UI can be built (API calls will fail until keys are configured)
- Journal UI can be built (database needed)

### For Testing AI Features
1. Get OpenAI API key from https://platform.openai.com
2. Update `OPENAI_API_KEY` in `.env.local`
3. Create or configure prompts
4. Restart Next.js server: Stop (Ctrl+C) and run `npm run dev`

### For Testing Database Features
1. Set up PostgreSQL (see options above)
2. Run `npx prisma db push`
3. Test with Prisma Studio: `npx prisma studio`

---

## Production Configuration

When deploying to production:

1. **Vercel** (Recommended):
   - Add environment variables in Project Settings > Environment Variables
   - Use Vercel Postgres for database (automatic integration)

2. **Other Platforms**:
   - Set environment variables in your hosting platform's dashboard
   - Use production database URL
   - Use production OpenAI API key (separate from development)

---

## Troubleshooting

### "Missing required environment variable: OPENAI_API_KEY"
- Check that `.env.local` exists in the project root
- Restart the dev server: `npm run dev`
- Make sure the file is named exactly `.env.local` (not `.env.local.txt`)

### "Prisma Client not generated"
```bash
npx prisma generate
```

### "Can't connect to database"
```bash
# Check PostgreSQL is running
sudo service postgresql status  # Linux
brew services list               # macOS

# Test connection
psql -h localhost -p 5432 -U postgres -d tarot
```

### "API routes return 500 errors"
- Check that environment variables are set
- Check server logs for detailed error messages
- For OpenAI errors: verify API key is valid and has credits

---

## Summary

✅ Environment file created: `.env.local`
✅ All required variables defined with dummy data
✅ File is git-ignored (won't be committed)
✅ Server automatically reloaded environment variables

**Ready to continue with Phase 3!** 🎉

The UI features can be built even without real API keys. You can add real credentials later when you want to test the AI functionality.
