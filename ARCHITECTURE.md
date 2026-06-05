# CareerOS Architecture

## Overview

CareerOS is an AI Career Intelligence System built for ambitious students. This architecture prioritizes:

- **Clean separation of concerns** (UI / Business / AI / Database)
- **Developer velocity** (minimal boilerplate, clear patterns)
- **Startup scalability** (monolithic but modular, easy to extend)
- **Production readiness** (type safety, error handling, observability)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, Framer Motion |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL (Supabase), Prisma ORM |
| AI | OpenAI API, Custom orchestration layer |
| State | Zustand |
| Analytics | PostHog |
| Hosting | Vercel |

---

## Folder Structure

```
careeros/
│
├── 📁 app/                          # Next.js App Router
│   ├── (routes)/                    # Route groups for organization
│   │   ├── dashboard/               # Main intelligence dashboard
│   │   ├── assessment/              # Adaptive assessment flow
│   │   ├── report/                  # Generated career reports
│   │   └── onboarding/              # User onboarding
│   │
│   ├── api/                         # API Routes (minimal, thin controllers)
│   │   ├── assessment/
│   │   │   └── route.ts             # Assessment submission endpoints
│   │   ├── report/
│   │   │   └── [id]/
│   │   │       └── route.ts         # Report CRUD
│   │   └── webhooks/
│   │       └── posthog/route.ts     # Analytics webhooks
│   │
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Global styles
│
├── 📁 components/                   # UI Components (strictly presentational)
│   ├── ui/                          # shadcn/ui components (auto-generated)
│   ├── layout/                      # Layout components
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── assessment/                  # Assessment-specific UI
│   │   ├── QuestionCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── CompletionScreen.tsx
│   ├── report/                      # Report visualization components
│   │   ├── InsightCard.tsx
│   │   ├── TraitVisualizer.tsx
│   │   └── CareerPathChart.tsx
│   └── shared/                      # Reusable across features
│       ├── AnimatedContainer.tsx
│       ├── LoadingState.tsx
│       └── ErrorBoundary.tsx
│
├── 📁 lib/                          # Business Logic (the brain)
│   ├── intelligence/                # Core intelligence engine
│   │   ├── engine.ts                # Main orchestrator
│   │   ├── types.ts                 # Intelligence domain types
│   │   ├── scoring/                 # Scoring algorithms
│   │   │   ├── index.ts
│   │   │   ├── traits.ts            # Personality trait scoring
│   │   │   ├── motivations.ts       # Motivation analysis
│   │   │   └── compatibility.ts     # Work compatibility scores
│   │   └── analysis/                # Analysis modules
│   │       ├── contradictions.ts    # Hidden contradiction detection
│   │       ├── career-fit.ts        # Career fit calculation
│   │       └── long-term.ts         # Long-term trajectory analysis
│   │
│   ├── assessment/                  # Assessment engine
│   │   ├── engine.ts                # Adaptive assessment logic
│   │   ├── question-bank/           # Question repository
│   │   │   ├── index.ts
│   │   │   ├── personality.ts
│   │   │   ├── values.ts
│   │   │   └── work-style.ts
│   │   ├── adaptive/                # Adaptive logic
│   │   │   ├── selector.ts          # Question selection algorithm
│   │   │   ├── difficulty.ts        # Difficulty adjustment
│   │   │   └── termination.ts       # When to stop assessment
│   │   └── validators.ts            # Input validation
│   │
│   ├── report/                      # Report generation
│   │   ├── generator.ts             # Main report generator
│   │   ├── sections/                # Report section builders
│   │   │   ├── summary.ts
│   │   │   ├── personality.ts
│   │   │   ├── recommendations.ts
│   │   │   └── action-plan.ts
│   │   └── formatters/              # Output formatters
│   │       ├── html.ts
│   │       └── pdf.ts               # Future PDF generation
│   │
│   └── auth/                        # Authentication helpers
│       └── helpers.ts
│
├── 📁 ai/                           # AI Layer (strictly AI logic)
│   ├── openai/                      # OpenAI integration
│   │   ├── client.ts                # Configured OpenAI client
│   │   ├── errors.ts                # AI error handling
│   │   └── rate-limiter.ts          # Rate limiting
│   │
│   ├── prompts/                     # Prompt engineering
│   │   ├── templates/               # Reusable prompt templates
│   │   │   ├── personality-analysis.ts
│   │   │   ├── career-recommendations.ts
│   │   │   └── contradiction-detection.ts
│   │   ├── builders/                # Dynamic prompt builders
│   │   │   ├── assessment-prompt.ts
│   │   │   └── report-prompt.ts
│   │   └── validators.ts            # Prompt output validation
│   │
│   ├── embeddings/                  # Vector embeddings (future RAG)
│   │   └── service.ts
│   │
│   └── orchestration/               # AI orchestration
│       ├── pipeline.ts              # Multi-step AI pipelines
│       ├── fallback.ts              # Fallback strategies
│       └── caching.ts               # AI response caching
│
├── 📁 db/                           # Database Layer (Prisma + queries)
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── migrations/              # Database migrations
│   │
│   ├── queries/                     # Organized query functions
│   │   ├── user.ts                  # User queries
│   │   ├── assessment.ts            # Assessment queries
│   │   ├── response.ts              # Response queries
│   │   └── report.ts                # Report queries
│   │
│   ├── mutations/                   # Write operations
│   │   ├── assessment.ts
│   │   ├── response.ts
│   │   └── report.ts
│   │
│   └── types.ts                     # Database types (from Prisma)
│
├── 📁 store/                        # Zustand State Management
│   ├── index.ts                     # Store exports
│   ├── slices/                      # State slices
│   │   ├── user-slice.ts
│   │   ├── assessment-slice.ts
│   │   ├── report-slice.ts
│   │   └── ui-slice.ts              # UI state (modals, etc.)
│   └── middleware/                  # Store middleware
│       └── persistence.ts
│
├── 📁 hooks/                        # Custom React Hooks
│   ├── use-assessment.ts            # Assessment state management
│   ├── use-report.ts                # Report data fetching
│   ├── use-analytics.ts             # PostHog tracking
│   └── use-auth.ts                  # Auth state
│
├── 📁 types/                        # Global TypeScript Types
│   ├── index.ts                     # Main exports
│   ├── assessment.ts                # Assessment types
│   ├── report.ts                    # Report types
│   ├── user.ts                      # User types
│   └── api.ts                       # API response types
│
├── 📁 utils/                        # Pure utility functions
│   ├── formatting.ts                # Date, number formatting
│   ├── validation.ts                # Input validation
│   ├── calculations.ts              # Math utilities
│   └── constants.ts                 # App constants
│
├── 📁 services/                     # External Service Integrations
│   ├── posthog.ts                   # Analytics service
│   ├── supabase.ts                  # Supabase client
│   └── openai.ts                    # OpenAI service wrapper
│
├── 📁 config/                       # Configuration
│   ├── site.ts                      # Site metadata
│   ├── ai.ts                        # AI configuration
│   ├── features.ts                  # Feature flags
│   └── limits.ts                    # Rate limits, quotas
│
├── 📁 public/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
│
└── 📄 Root Config Files
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── prisma.config.ts
    ├── .env.example
    └── package.json
```

---

## Key Architectural Decisions

### 1. **Separation of Concerns**

```
UI Layer (components/)
    ↓ calls
Business Logic (lib/)
    ↓ calls
AI Layer (ai/)
    ↓ calls
Database Layer (db/)
```

**Rule**: Components never call AI or database directly. Always go through business logic layer.

### 2. **Next.js App Router Structure**

- **Route Groups** `(routes)/` for organization without affecting URL
- **Server Components** by default (data fetching, SEO)
- **Client Components** only when needed (interactivity, hooks)
- **Server Actions** for form submissions (no API routes needed)
- **API Routes** only for webhooks, external integrations

### 3. **Intelligence Engine (`lib/intelligence/`)**

The core differentiator of CareerOS. Modular design allows:

```typescript
// lib/intelligence/engine.ts
export class IntelligenceEngine {
  async analyzeProfile(data: AssessmentData): Promise<ProfileAnalysis> {
    const traits = await this.scoring.traits.calculate(data);
    const motivations = await this.scoring.motivations.calculate(data);
    const contradictions = await this.analysis.contradictions.detect(traits);
    
    return this.synthesize({ traits, motivations, contradictions });
  }
}
```

### 4. **Adaptive Assessment Engine (`lib/assessment/`)**

Smart question selection based on previous answers:

```typescript
// lib/assessment/adaptive/selector.ts
export class QuestionSelector {
  selectNext(state: AssessmentState): Question {
    // Information gain algorithm
    // Difficulty calibration
    // Category balancing
  }
}
```

### 5. **AI Layer (`ai/`)**

Strict isolation of AI concerns:

- **Prompts**: Version controlled, tested, reusable
- **Orchestration**: Retry logic, fallbacks, caching
- **Validation**: Output schema validation

### 6. **Database Layer (`db/`)**

Prisma best practices:

```typescript
// db/queries/assessment.ts
export async function getAssessmentWithResponses(id: string) {
  return prisma.assessment.findUnique({
    where: { id },
    include: { responses: true }
  });
}
```

- All queries in one place
- Type-safe with Prisma
- Easy to optimize/audit

### 7. **State Management (Zustand)**

Simple, effective state slicing:

```typescript
// store/slices/assessment-slice.ts
export interface AssessmentSlice {
  currentQuestion: number;
  responses: Response[];
  submitResponse: (response: Response) => void;
}
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `QuestionCard.tsx` |
| Hooks | camelCase with use prefix | `useAssessment.ts` |
| Utilities | camelCase | `formatDate.ts` |
| Types | PascalCase | `AssessmentTypes.ts` |
| Constants | UPPER_SNAKE_CASE | `API_LIMITS.ts` |
| Folders | kebab-case | `question-bank/` |

### Functions

```typescript
// Async operations: verb + noun
async function fetchUserProfile() { }
async function generateReport() { }

// Boolean checks: is/has/should + noun
function isAssessmentComplete() { }
function hasValidResponse() { }

// Transformations: noun + to + format
function reportToHtml(report: Report) { }
```

### Database

```prisma
// Table names: PascalCase, singular
model User { }
model Assessment { }
model CareerReport { }

// Fields: camelCase
userId    String
startDate DateTime
```

---

## Future Module Preparation

Architecture prepared for:

### 1. **Career Simulation** (`lib/simulation/`)
- Add folder: `lib/simulation/`
- Extend intelligence engine
- Add simulation-specific prompts

### 2. **AI Mentor** (`lib/mentor/`)
- Add folder: `lib/mentor/`
- Chat interface components
- Conversation memory in DB

### 3. **Decision Engine** (`lib/decisions/`)
- Add folder: `lib/decisions/`
- Decision tree logic
- Outcome probability scoring

### 4. **Country Fit** (`lib/geography/`)
- Add folder: `lib/geography/`
- Location-based scoring
- Immigration/culture factors

### 5. **Founder Potential** (`lib/entrepreneurship/`)
- Add folder: `lib/entrepreneurship/`
- Founder trait analysis
- Startup fit scoring

Each module follows the same pattern: business logic in `lib/`, AI prompts in `ai/prompts/`, UI in `components/`.

---

## Development Workflow

### 1. Adding a Feature

```
1. Define types in types/
2. Add database schema in db/prisma/
3. Implement business logic in lib/
4. Add AI prompts if needed in ai/prompts/
5. Build UI in components/
6. Connect with hooks/
7. Add analytics tracking
```

### 2. Database Changes

```bash
# 1. Update schema
# 2. Generate migration
npx prisma migrate dev --name add_feature

# 3. Update types (auto-generated)
npx prisma generate

# 4. Update queries in db/queries/
```

### 3. AI Prompt Changes

```bash
# 1. Modify prompt in ai/prompts/
# 2. Test with examples
# 3. Version control the prompt
# 4. Update orchestration if needed
```

---

## Performance Guidelines

### Server Components
- Use for static/marketing pages
- Use for data-heavy dashboard sections
- Fetch data at component level

### Client Components
- Use for interactive elements
- Use for real-time updates
- Minimize "use client" directives

### Database
- Use `select` to limit fields
- Use `include` carefully (N+1 risk)
- Add indexes for query patterns

### AI
- Cache responses when possible
- Implement rate limiting
- Use streaming for long responses

---

## Security Checklist

- [ ] Environment variables in `.env.local` (never commit)
- [ ] API routes validate authentication
- [ ] Database uses RLS (Row Level Security)
- [ ] AI inputs sanitized
- [ ] Rate limiting on AI endpoints
- [ ] No secrets in client-side code

---

## Monitoring & Observability

- **PostHog**: User behavior, funnel analysis
- **Vercel Analytics**: Performance monitoring
- **Supabase Dashboard**: Database metrics
- **OpenAI Dashboard**: AI usage & costs

---

## Summary

This architecture provides:

✅ **Clean separation** of UI, business, AI, and database logic
✅ **Scalability** through modular design
✅ **Developer velocity** with clear patterns
✅ **Type safety** throughout the stack
✅ **Future-proofing** for new modules
✅ **Production readiness** with error handling, monitoring

The monolithic structure is perfect for a startup: simple to understand, fast to develop, easy to deploy, but cleanly organized for future growth.
