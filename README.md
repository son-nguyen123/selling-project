# ProjectHub - Digital Projects Marketplace

A beautiful, fully responsive marketplace application built with Next.js 16, React 19, and Supabase for discovering and purchasing premium digital projects, code templates, and components.

## Features

✨ **Modern Design**
- Dark theme with elegant golden accents
- Beautiful responsive grid layout
- Smooth hover animations and transitions
- Mobile-first design that works on all devices

🔍 **Search & Discovery**
- Real-time search by project name, description, or technology
- Filter by category (Web App, Mobile, Backend, Component Library, etc.)
- Sort by featured, latest, price (low to high, high to low)
- Live search results with instant filtering

💼 **Project Showcase**
- Detailed project cards with images, ratings, and reviews
- Tech stack display for each project
- Author information and pricing
- Wishlist functionality for saved favorites

🗄️ **Database Integration**
- Full Supabase integration for data persistence
- Server-side rendering for optimal performance
- Real-time project data fetching
- Scalable architecture for future features

## Tech Stack

- **Frontend**: Next.js 16, React 19.2, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (pre-configured)
- **Icons**: Lucide React
- **Build**: Turbopack (stable in Next.js 16)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- npm, pnpm, or yarn package manager

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (for server-side operations)

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

The application uses the following main tables:

### users
- `id` (UUID, Primary Key)
- `name` (Text)
- `email` (Text, Unique)
- `created_at` (Timestamp)

### projects
- `id` (Integer, Primary Key)
- `title` (Text) - Project name
- `description` (Text) - Detailed description
- `price` (Decimal) - Project price
- `category` (Text) - Project category
- `tech_stack` (Text) - Comma-separated technologies
- `cover_image_url` (Text) - Project cover image URL
- `author_id` (UUID, Foreign Key) - Reference to users table
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### wishlist (future implementation)
- `id` (Integer, Primary Key)
- `user_id` (UUID, Foreign Key)
- `project_id` (Integer, Foreign Key)
- `created_at` (Timestamp)

## Project Structure

```
/app
  /api/projects          # API routes for project operations
  /auth                  # Authentication pages (optional)
  layout.tsx             # Root layout with metadata
  page.tsx               # Home page (server component)
  globals.css            # Global styles and theme tokens

/components
  header.tsx             # Navigation header
  hero.tsx               # Hero banner section
  project-card.tsx       # Individual project card component
  filter-sidebar.tsx     # Filters sidebar (optional)
  footer.tsx             # Footer with links
  /ui                    # shadcn/ui components

/lib/supabase
  client.ts              # Client-side Supabase client
  server.ts              # Server-side Supabase client
  proxy.ts               # Session management proxy

/scripts
  seed-projects.sql      # Database seeding script

middleware.ts            # Next.js middleware for auth
```

## Key Features Implemented

### Search Functionality
Users can search across project titles, descriptions, and technologies in real-time. The search parameter is passed via URL query strings for better shareability.

### Category Filtering
Projects can be filtered by category, with a visual badge system for easy selection. Categories are defined in the database.

### Sorting Options
Projects can be sorted by:
- Featured (default)
- Latest (most recently added)
- Price: Low to High
- Price: High to Low

### Responsive Design
- Mobile-first approach with breakpoints at sm, md, lg, xl
- Touch-friendly button sizes and spacing
- Hamburger menu on mobile devices
- Optimized image sizes for different screen sizes

## Database Seeding

The project includes a seed script that populates the database with sample data:

```bash
pnpm exec supabase db push scripts/seed-projects.sql
```

This creates sample users and projects for testing and demonstration.

## Environment Variables

Create a `.env.local` file (for local development) with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

These are automatically configured if you use the Vercel integration.

## Styling

The application uses Tailwind CSS v4 with a custom design token system defined in `globals.css`. The theme supports both light and dark modes with carefully chosen colors:

- **Primary**: Deep black (#1a1a1a)
- **Accent**: Warm gold (#C4742D)
- **Neutrals**: Various shades of gray
- **Background**: Light gray (#fafaf8) or dark (#191919)

## Future Enhancements

- User authentication and profiles
- Shopping cart and checkout integration
- Payment processing with Stripe
- Wishlist persistence to database
- User reviews and ratings
- Project upload and management system
- Admin dashboard for moderation
- Notification system
- Real-time notifications with Supabase subscriptions

## Performance Optimizations

- Server-side rendering for SEO
- Image optimization with Next.js Image component
- Efficient database queries
- Caching strategies with Supabase
- Minimal JavaScript with server components

## Deployment

Deploy to Vercel with a single click:

1. Push your code to GitHub
2. Connect your GitHub repository in Vercel
3. Add environment variables in Vercel Settings
4. Deploy!

The application will automatically scale and handle traffic efficiently on Vercel's infrastructure.

## Support

For issues or questions:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Review [Next.js 16 documentation](https://nextjs.org/docs)
3. Check [shadcn/ui component docs](https://ui.shadcn.com/)

## License

This project is open source and available for personal and commercial use.
