# CLAUDE.md - Next.js Personal Website Guidelines

## Build/Test Commands
- `npm run dev` - Run development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Code Style Guidelines
- **TypeScript**: Use strict mode with proper interfaces/types (see `GetBlogPosts.ts`)
- **Components**: Functional components with named exports (`const Component = () => {}`)
- **Imports**: Group React imports first, then third-party, then local
- **Naming**: camelCase for variables/functions, PascalCase for components/interfaces
- **State Management**: React hooks for local state
- **CSS**: Use Tailwind classes (configured in `tailwind.config.ts`)
- **Blog Posts**: Markdown files in `app/content/blog` with frontmatter
- **Error Handling**: Try/catch blocks around file operations
- **File Structure**: Pages in app directory following Next.js 14+ conventions
- **Testing**: No testing setup found (add Jest/React Testing Library if needed)