# Quickstart Guide: Frontend UI & Pages Implementation

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Git for version control
- Backend API running on http://localhost:8000

### 1. Clone and Setup
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd hackathon2-todo-app

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Todo App
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Run Development Server
```bash
# Start the development server
npm run dev

# Application will be available at http://localhost:3000
```

---

## Key Components Overview

### Authentication System
The app uses JWT-based authentication with cookie storage:

```typescript
// Example of using auth context
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.name}!</div>;
}
```

### Task Management
Interact with tasks through the task service:

```typescript
// Example of creating a task
import { taskService } from '@/services/taskService';

async function createNewTask() {
  try {
    const newTask = await taskService.createTask({
      title: 'New task',
      description: 'Task description'
    });
    console.log('Task created:', newTask);
  } catch (error) {
    console.error('Failed to create task:', error);
  }
}
```

---

## Development Workflow

### Adding New Pages
1. Create page in `src/app/` directory following App Router conventions
2. Use `"use client"` directive if page needs interactivity
3. Leverage existing contexts and services
4. Add proper TypeScript typing

### Creating New Components
1. Create reusable components in `src/components/`
2. Follow atomic design principles
3. Use TypeScript interfaces for props
4. Add proper accessibility attributes

### API Integration
1. Add new endpoints to appropriate service file
2. Update type definitions in `src/types/`
3. Handle errors consistently
4. Test with mock data first

---

## Common Tasks

### Run Tests
```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/__tests__/specific-test.tsx
```

### Build for Production
```bash
# Create production build
npm run build

# Run production build locally
npm run start
```

### Type Checking
```bash
# Check TypeScript compilation
npm run type-check

# Check with watch mode
npm run type-check -- --watch
```

### Linting & Formatting
```bash
# Check code style
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code with Prettier
npm run format
```

---

## Troubleshooting

### Common Issues

#### "use client" Directive Missing
**Problem:** Using React hooks or events without directive
**Solution:** Add `'use client';` at the top of the component file

#### API Requests Failing
**Problem:** Network errors or CORS issues
**Solution:** Verify backend is running and CORS is configured properly

#### Token Not Persisting
**Problem:** User gets logged out after refresh
**Solution:** Check cookie settings and ensure middleware is configured correctly

#### Component Not Rendering
**Problem:** Blank page or hydration errors
**Solution:** Check server vs client component boundaries

### Debugging Tips
1. Check browser console for errors
2. Verify environment variables are set
3. Confirm backend API is running
4. Look for TypeScript compilation errors
5. Check network tab for API request failures

---

## Performance Tips

### Optimizing Bundle Size
- Use dynamic imports for non-critical components
- Implement code splitting at route level
- Optimize images with Next.js Image component
- Remove unused dependencies

### Improving Load Times
- Leverage Next.js caching headers
- Implement proper loading states
- Use skeleton screens for better perceived performance
- Optimize API response sizes

---

## Security Best Practices

### Authentication
- JWT tokens stored in secure cookies
- Token validation on every API request
- Automatic logout on token expiration
- Proper route protection via middleware

### Input Handling
- Validate all user inputs on client and server
- Sanitize data before processing
- Use HTTPS in production
- Implement CSRF protection

---

## Next Steps

### Immediate Actions
1. Review the detailed specifications in `spec.md`
2. Check the implementation plan in `plan.md`
3. Run the development server to verify setup
4. Test authentication flow
5. Verify API integration

### Development Sequence
1. Complete basic page components
2. Implement authentication system
3. Build task management features
4. Add middleware protection
5. Test and optimize performance

---

## Helpful Commands

### Development
```bash
npm run dev           # Start development server
npm run build         # Create production build
npm run start         # Start production server
npm run lint          # Run ESLint
npm run type-check    # Run TypeScript compiler
npm run format        # Format code with Prettier
```

### Testing
```bash
npm test              # Run all tests
npm test -- --watch   # Run tests in watch mode
npm run test:unit     # Run unit tests only
npm run test:e2e      # Run end-to-end tests
```

### Deployment
```bash
npm run build         # Prepare for deployment
npm run export        # Export static version (if needed)
vercel deploy         # Deploy to Vercel (recommended)
```

---

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Context API](https://react.dev/reference/react/useContext)

### Tools Used
- React 18+ with TypeScript
- Next.js 16+ with App Router
- Tailwind CSS for styling
- Axios for API requests
- js-cookie for cookie management
- Lucide React for icons

---

**Ready to Develop:** ✅ Environment configured and ready for implementation
**Support:** Check the detailed specification and implementation plan for full guidance