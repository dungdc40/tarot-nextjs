# Project Context

## Purpose
A Next.js-based AI-powered tarot reading application that provides personalized, interactive tarot readings with OpenAI integration. The app guides users through an intuitive ritual experience including intent collection, card selection, and AI-generated interpretations. Users can explore the full 78-card Rider-Waite deck, receive contextual readings based on their questions, and maintain a personal journal of past readings.

## Tech Stack
- **Framework**: Next.js 16.0.7 (App Router with React 18.3.1)
- **Language**: TypeScript 5.9.3 with strict mode enabled
- **Styling**: Tailwind CSS 4.1.17 with custom neumorphic design system
- **State Management**:
  - Zustand 5.0.8 for reading flow state
  - TanStack React Query 5.90.10 for server state
- **Database**: PostgreSQL with Prisma 6.1.0 ORM
- **AI Integration**: OpenAI 6.9.1 for intent assessment, spread generation, and interpretations
- **Animation**: Framer Motion 12.23.24 for smooth transitions
- **Validation**: Zod 4.1.12 for runtime type validation
- **Icons**: Lucide React 0.554.0
- **Carousel**: Embla Carousel React 8.6.0

## Project Conventions

### Code Style
- **TypeScript**: Strict mode with comprehensive type definitions in `/types` directory
- **File Organization**: Feature-based structure with clear separation of concerns
  - `/app` - Next.js App Router pages and API routes
  - `/components` - Reusable React components organized by feature
  - `/lib` - Business logic, services, utilities, and contexts
  - `/stores` - Zustand state management stores
  - `/types` - Comprehensive TypeScript type definitions
  - `/prisma` - Database schema and migrations
- **Naming Conventions**:
  - Components: PascalCase (e.g., `CardRevealScreen.tsx`)
  - Services: PascalCase with `Service` suffix (e.g., `AIService.ts`)
  - Utilities: camelCase (e.g., `cardImageUtils.ts`)
  - Types/Interfaces: PascalCase (e.g., `ChatSession`, `ReadingFlowState`)
- **Import Paths**: Use `@/` alias for absolute imports from project root
- **Component Structure**: Functional components with TypeScript interfaces for props
- **API Routes**: RESTful conventions with typed request/response bodies

### Architecture Patterns
- **State Machine Pattern**: Reading flow uses discriminated union types for type-safe state transitions
- **Service Layer**: Business logic abstracted into service classes (`AIService`, `DeckService`)
- **Type Guards**: Extensive use of type guards for runtime type narrowing (see `types/reading.ts`)
- **Discriminated Unions**: Message data uses tagged union types for type-safe handling
- **Server Components**: Leverage Next.js App Router server components where appropriate
- **API Route Handlers**: Next.js route handlers for server-side operations
- **Context Providers**: React Context for cross-cutting concerns (Toast notifications)
- **Custom Hooks**: Encapsulated logic in reusable hooks
- **Error Boundaries**: React error boundaries for graceful error handling

### Testing Strategy
- No formal test suite currently implemented
- ESLint configured with Next.js and TypeScript rules
- Type-checking via TypeScript compiler serves as first line of defense
- Manual testing for user flows and AI integration

### Git Workflow
- Project currently not initialized as git repository
- Development environment tracks progress in markdown files (`PHASE3_PROGRESS.md`, etc.)
- No formal branching strategy in place yet

## Domain Context

### Tarot Reading Domain
- **Deck**: Full 78-card Rider-Waite tarot deck (22 Major Arcana + 56 Minor Arcana)
- **Card Properties**: Each card has upright/reversed meanings and rich symbolic imagery
- **Spreads**: Dynamic spread generation based on user intent (3-10 cards typical)
- **Reading Flow**: Multi-stage ritual experience:
  1. Intent collection and clarification
  2. Ritual preparation phase
  3. Card shuffling animation
  4. Interactive card selection
  5. Card reveal with suspenseful animation
  6. AI-generated interpretation synthesis
  7. Follow-up questions and clarification cards

### AI Integration Patterns
- **Intent Assessment**: Multi-turn conversation to clarify user's question
- **Spread Selection**: AI determines optimal spread layout based on intent
- **Card Interpretation**: Context-aware interpretations considering position and surrounding cards
- **Synthesis**: Holistic reading combining individual card meanings
- **Follow-ups**: Explanation requests and clarification card draws

## Important Constraints

### Technical Constraints
- **Database**: Requires PostgreSQL connection (connection string in `.env.local`)
- **AI API**: Requires valid OpenAI API key with sufficient quota
- **Image Assets**: Card images must exist in `/public/cards/rider-waite-smith/` directory
- **Browser Support**: Modern browsers with ES2017+ support
- **Performance**: AI responses can take 5-15 seconds; requires loading states

### Design Constraints
- **Neumorphic Design System**: Consistent use of soft shadows and raised/sunken surfaces
- **Color Palette**: Soothing blue pastels for accessible, calming aesthetic
- **Accessibility**: WCAG-compliant color contrast, semantic HTML, ARIA labels
- **Typography**: Playfair Display (serif) for headings, Inter (sans-serif) for body
- **Responsive**: Mobile-first design with breakpoints at sm/md/lg

### Business Constraints
- **Privacy**: No user authentication; journal entries stored locally by session
- **Rate Limiting**: OpenAI API calls must be managed to avoid quota exhaustion
- **Cost Management**: AI tokens consumed per reading (typically 1000-3000 tokens)

## External Dependencies

### Critical APIs
- **OpenAI API** (GPT-4): Powers all AI features
  - Intent assessment and clarification
  - Spread generation
  - Card interpretations and synthesis
  - Explanation requests
  - Configured in `lib/config/openai.ts`

### Database
- **PostgreSQL**: Primary data store for journal entries
  - Schema managed via Prisma
  - Single table: `journal_entries` with JSONB for chat sessions
  - Indexed by creation date for efficient querying

### External Resources
- **Google Fonts**: Playfair Display and Inter fonts loaded via CDN
- **Card Images**: Static assets stored in `/public/cards/` directory
- **Logo Assets**: Brand assets in `/public/icons/`

### Development Tools
- **Next.js Dev Server**: Hot module replacement for development
- **Prisma Studio**: Database GUI for development
- **ESLint**: Code quality and style enforcement
- **TanStack Query Devtools**: React Query debugging in development mode
