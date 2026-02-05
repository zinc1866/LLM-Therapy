# Therapy Training Platform

An AI-powered web application for clinical psychology students to practice psychotherapy skills with simulated clients representing diverse intersectional identities.

## Features

- **Instructor Dashboard**: Create simulated clients with detailed identity profiles, assign them to students, and review all session transcripts
- **Student Dashboard**: View assigned clients, conduct 50-minute therapy sessions, and review your own transcripts
- **AI-Powered Clients**: Claude AI simulates realistic client responses based on configured demographics, identities, and presenting concerns
- **Session Continuity**: Full context is maintained across three consecutive sessions
- **Strict Timing**: 50-minute session timer with warnings at 10, 5, and 1 minute
- **Transcript Export**: Download session transcripts for review and supervision

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Auth**: NextAuth.js
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An Anthropic API key ([get one here](https://console.anthropic.com/))

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

3. **Initialize the database**:
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Seed the database with sample data** (optional but recommended):
   ```bash
   npm run db:seed
   ```
   This creates:
   - Instructor account: `instructor@example.com` / `instructor123`
   - Student account: `student@example.com` / `student123`
   - Three sample clients with diverse backgrounds

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Instructors

1. Log in with an instructor account
2. Go to **Clients** to create simulated client profiles
3. Configure client demographics, identities, and clinical details
4. Go to **Students** to assign clients to enrolled students
5. Go to **Transcripts** to review student session transcripts

### For Students

1. Log in with a student account
2. View your assigned clients on the dashboard
3. Click **Start Session** to begin a therapy session
4. The 50-minute timer starts immediately
5. Introduce yourself and conduct the session
6. Complete three sessions with each client
7. Review your transcripts under **My Transcripts**

## Client Identity Options

Instructors can configure clients with the following identity factors:

- Age, pronouns, gender identity
- Race/ethnicity, nationality
- Sexual orientation (LGBTQA2SI+)
- Disability status
- Religious/spiritual background
- Socioeconomic status
- Immigration status
- Indigenous identity
- Veteran status

## Session Flow

1. **Session 1**: Initial meeting, establish rapport, present concerns
2. **Session 2**: Deepen exploration, build on previous session
3. **Session 3**: Continue work, show progress or ongoing challenges

The AI maintains full memory of previous sessions to ensure continuity.

## Deployment to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` (use Vercel Postgres)
   - `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL)
   - `ANTHROPIC_API_KEY`
4. Deploy!

## Estimated Costs

Using Claude 3.5 Sonnet:
- ~$0.50-1.50 per 50-minute session
- ~$1.50-4.50 per student (3 sessions)
- ~$150-450 for 100 students

## License

This project is for educational use.
