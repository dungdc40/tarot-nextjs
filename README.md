# Tarot Reading App

An AI-powered tarot reading application built with Next.js that provides personalized, interactive tarot readings with OpenAI integration. Users can explore the full 78-card Rider-Waite deck, receive contextual readings based on their questions, and maintain a personal journal of past readings.

## Features

### Core Features
- **AI-Powered Readings**: Multi-turn conversation flow with intent assessment, spread generation, and contextual card interpretations
- **Interactive Reading Ritual**: Immersive experience including shuffling animation, card selection carousel, and 3D card reveal
- **Deck Browser**: Explore all 78 Rider-Waite tarot cards with filtering by Major Arcana, Minor Arcana, and suits
- **Card Details**: View comprehensive card information including meanings, keywords, and category-specific interpretations
- **"Why?" Explanations**: Select any text in readings to request AI explanations with recursive support
- **Clarification Cards**: Request follow-up cards and explanations during readings
- **Reading Journal**: Save, view, and delete completed readings with full history
- **Quick Draw**: Single card draws without authentication for daily guidance
- **User Authentication**: Clerk-based authentication with Email/Password, Google OAuth, and Facebook OAuth

### User Experience
- **Neumorphic Design**: Soft shadows and raised/sunken surfaces with soothing blue pastel colors
- **Smooth Animations**: Framer Motion for card flips, transitions, and UI interactions
- **Responsive Design**: Mobile-first approach with breakpoints for all screen sizes
- **Accessible**: WCAG-compliant color contrast, semantic HTML, and ARIA labels

## Tech Stack

### Frontend
- **Framework**: Next.js 16.0.7 (App Router)
- **Language**: TypeScript 5.9.3 (strict mode)
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 4.1.17
- **Animations**: Framer Motion 12.23.24
- **Icons**: Lucide React 0.554.0
- **Carousel**: Embla Carousel React 8.6.0

### State Management
- **Client State**: Zustand 5.0.8
- **Server State**: TanStack React Query 5.90.10

### Backend
- **Database**: PostgreSQL with Prisma 6.1.0 ORM
- **AI Integration**: OpenAI 6.9.1 (GPT-4)
- **Authentication**: Clerk Next.js 6.36.2
- **Validation**: Zod 4.1.12

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud-hosted)
- OpenAI API key
- Clerk account for authentication

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tarot-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and configure:

**OpenAI Configuration**
```bash
OPENAI_API_KEY=sk-your-actual-api-key
OPENAI_BASE_URL=https://api.openai.com/v1
```

**Database Configuration**
```bash
# Local PostgreSQL
DATABASE_URL="postgresql://localhost:5432/tarot"

# Or use cloud providers:
# Supabase: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
# Railway, Neon, DigitalOcean, etc.
```

**Clerk Authentication**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

**Next.js Configuration**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

4. Set up the database:
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to browse data
npx prisma studio
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup Options

### Option 1: Local PostgreSQL (Recommended for Development)
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
```

### Option 2: Supabase (Free Cloud Database)
1. Sign up at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database > Connection String
4. Copy the connection string and update `DATABASE_URL` in `.env.local`
5. Run: `npx prisma db push`

### Option 3: Other Providers
- **Railway**: [https://railway.app](https://railway.app) - Free tier available
- **Neon**: [https://neon.tech](https://neon.tech) - Serverless PostgreSQL with free tier
- **DigitalOcean**: Managed PostgreSQL (~$15/month)

## Clerk Authentication Setup

1. Create a free account at [https://clerk.com](https://clerk.com)
2. Create a new application
3. Enable authentication methods (Email/Password, Google, Facebook)
4. Copy API keys from the dashboard:
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`
5. Configure redirect URLs in Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/`

## Project Structure

```
tarot-nextjs/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── ai/              # AI endpoints (intent, spread, reading, explanation)
│   │   └── journal/         # Journal CRUD operations
│   ├── decks/               # Deck browser pages
│   ├── journal/             # Journal list and detail pages
│   ├── reading/             # Main reading flow page
│   ├── quick-draw/          # Quick single-card draw
│   ├── sign-in/             # Clerk sign-in page
│   ├── sign-up/             # Clerk sign-up page
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── layout/              # Layout components
│   ├── reading/             # Reading flow components
│   ├── decks/               # Deck browser components
│   ├── journal/             # Journal components
│   └── quick-draw/          # Quick draw components
├── lib/                     # Business logic
│   ├── services/            # Service layer (AI, Deck, Card)
│   ├── utils/               # Utility functions
│   ├── db/                  # Database operations
│   └── config/              # Configuration files
├── stores/                  # Zustand state stores
├── types/                   # TypeScript type definitions
├── prisma/                  # Database schema and migrations
│   └── schema.prisma        # Prisma schema
├── public/                  # Static assets
│   ├── cards/               # Card images
│   ├── data/                # JSON data files
│   └── videos/              # Animation videos
└── openspec/                # OpenSpec documentation
    ├── project.md           # Project conventions
    ├── specs/               # Current specifications
    └── changes/             # Change proposals
```

## Key Features Explained

### Reading Flow
The reading experience follows a structured flow with 14 distinct states:

1. **Intent Collection**: Multi-turn conversation to clarify user's question
2. **Intent Assessment**: AI evaluates if intention is clear enough
3. **Ritual Interface**: 3-second hold interaction for mindful preparation
4. **Shuffling Animation**: Deck shuffling with video animation
5. **Card Selection**: Horizontal carousel for picking cards (70% overlap)
6. **Card Reveal**: 3D flip animation revealing selected cards
7. **Reading Generation**: AI generates comprehensive reading with synthesis
8. **Interactive Features**: Click cards for details, select text for "Why?" explanations
9. **Clarification Flow**: Request additional cards and follow-up questions
10. **Journal Saving**: Save completed readings for future reference

### Deck Browser
- Browse all 78 Rider-Waite tarot cards
- Filter by category (Major Arcana, Wands, Cups, Swords, Pentacles)
- Horizontal card carousel with thumbnails
- Click any card to view full details
- Toggle between upright and reversed meanings
- View category-specific interpretations (Love, Career, Finance, Health, Spiritual)

### Journal System
- Save completed readings to PostgreSQL database
- View chronological list of past readings
- Click to view full reading history
- Delete readings with confirmation
- Auto-save on navigation away from reading page
- User-specific entries (protected by authentication)

### Quick Draw
- No authentication required
- Single card draw from shuffled deck
- Card reveal with 3D flip animation
- View card meaning in modal popup
- Draw another card or return to home

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Development Tools

```bash
# Prisma Studio (Database GUI)
npx prisma studio
# Opens at http://localhost:5555

# Generate Prisma Client after schema changes
npx prisma generate

# Push schema changes to database
npx prisma db push

# Create and apply migrations
npx prisma migrate dev --name migration-name
```

## OpenSpec Workflow

This project uses [OpenSpec](https://github.com/openspec-dev/openspec) for spec-driven development. See `openspec/AGENTS.md` for detailed instructions.

### Quick Reference

```bash
# List active changes and specs
openspec list
openspec list --specs

# View change or spec details
openspec show [item]

# Validate changes
openspec validate [change] --strict

# Archive completed changes
openspec archive <change-id> --yes
```

### Creating Changes

1. Review existing specs and changes
2. Create proposal in `openspec/changes/<change-id>/`
3. Write delta specs using ADDED/MODIFIED/REMOVED
4. Validate with `openspec validate --strict`
5. Implement after approval
6. Archive after deployment

## Architecture Patterns

### State Management
- **State Machine Pattern**: Reading flow uses discriminated union types for type-safe state transitions
- **Server State**: React Query for API data fetching with automatic caching and refetching
- **Client State**: Zustand for reading flow state and UI state

### Service Layer
- **AIService**: OpenAI integration for intent assessment, spread generation, and interpretations
- **DeckService**: Deck data management and shuffling
- **CardImageService**: Card image utilities and asset management

### Type Safety
- **Discriminated Unions**: Message data uses tagged union types
- **Type Guards**: Extensive runtime type narrowing (see `types/reading.ts`)
- **Zod Validation**: Runtime validation for API requests/responses

## Testing

### Manual Testing Checklist

**Deck Browser**
- Navigate to `/decks`
- View deck detail page
- Filter by category (Major/Minor Arcana, Suits)
- Click card thumbnails in carousel
- View full card details
- Toggle upright/reversed meanings

**Reading Flow**
- Start new reading from home page
- Enter intent and clarify with AI
- Complete ritual (3-second hold)
- Watch shuffling animation
- Select cards from carousel
- View card reveal animation
- Read synthesis and card interpretations
- Click cards to view full details
- Select text and request "Why?" explanations
- Request clarification cards
- Save reading to journal

**Journal**
- View journal list at `/journal`
- Click to view saved reading
- Delete reading with confirmation
- Verify empty state for new users

**Quick Draw**
- Access from home page without sign-in
- Select single card from shuffled deck
- View card reveal
- Click "Meaning" to see card details
- Draw another card

**Authentication**
- Sign up with email/password
- Sign in with Google OAuth
- Sign in with Facebook OAuth
- Verify protected routes redirect to sign-in
- Verify journal entries are user-specific

## Known Constraints

### Technical Constraints
- Requires PostgreSQL database connection
- Requires valid OpenAI API key with sufficient quota
- Card images must exist in `/public/cards/rider-waite-smith/`
- Modern browser with ES2017+ support required
- AI responses can take 5-15 seconds; loading states required

### Design Constraints
- Neumorphic design system with soft shadows
- Soothing blue pastel color palette for accessibility
- WCAG-compliant color contrast
- Playfair Display (serif) for headings, Inter (sans-serif) for body
- Mobile-first responsive design

### Business Constraints
- OpenAI API costs: 1000-3000 tokens per reading
- Rate limiting required to prevent API quota exhaustion
- Authentication required for reading and journal features
- Quick Draw is the only feature available without authentication

## Migration Status

The project has been successfully migrated from a Flutter application to Next.js.

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation | Complete | 100% |
| Phase 2: Services Layer | Complete | 100% |
| Phase 3: Features | Complete | 95% |
| - Deck Browser | Complete | 100% |
| - Reading Flow | Complete | 100% |
| - Journal | Complete | 100% |
| - Quick Draw | Complete | 100% |
| - Authentication | Complete | 100% |

**Overall Migration Progress: 95%**

Only polish, testing, and deployment remain.

## Recent Changes

### Add Clerk Authentication
User authentication system using Clerk for Email/Password, Google, and Facebook OAuth. Protected routes and user-specific journal entries.

### Add Quick Draw Feature
Single-card draw feature accessible without authentication for casual daily guidance.

### Add Production Deployment
Deployment configuration for Vercel with environment variable management and database migration strategy.

## Troubleshooting

### "Missing required environment variable: OPENAI_API_KEY"
- Verify `.env.local` exists in project root
- Check variable name spelling
- Restart dev server: `npm run dev`

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
- Check environment variables are set correctly
- Review server logs for detailed error messages
- For OpenAI errors: verify API key is valid and has credits
- For database errors: ensure Prisma Client is generated and database is accessible

### "Authentication not working"
- Verify Clerk API keys in `.env.local`
- Check Clerk dashboard for correct redirect URLs
- Clear browser cookies and try again
- Restart dev server after changing Clerk configuration

## Contributing

This project uses OpenSpec for change management. Before contributing:

1. Read `openspec/AGENTS.md` for workflow instructions
2. Review existing specs in `openspec/specs/`
3. Check active changes with `openspec list`
4. Create a proposal for significant changes
5. Validate with `openspec validate --strict`

## License

ISC

## Acknowledgments

- **Rider-Waite Tarot Deck**: Classic tarot imagery by A.E. Waite and Pamela Colman Smith
- **OpenAI**: GPT-4 powers all AI features
- **Clerk**: Authentication and user management
- **OpenSpec**: Spec-driven development framework
