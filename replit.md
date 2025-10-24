# Teto·Egen Personality Test

## Overview

The Teto·Egen Personality Test is a web application that analyzes users' facial features and psychological survey responses to classify them into three emotional personality types: Teto (rational), Egen (emotional), or Tegen (balanced). The application uses browser-based AI to extract facial features from uploaded photos, conducts a 10-question psychological survey, and generates personalized personality reports with physiognomic analysis and animal type classifications (dog, cat, fox, rabbit, bear, or deer).

The application prioritizes user privacy by processing all facial feature extraction locally in the browser using TensorFlow.js and MediaPipe FaceMesh - photos are never sent to a server and are immediately deleted after analysis. AI-powered report generation is performed client-side using WebLLM (TinyLlama or Qwen models) via WebGPU.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript
- Vite for build tooling and development server
- React Router via Wouter for client-side routing
- Single Page Application (SPA) architecture

**UI Component System:**
- Shadcn UI components based on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Mobile-first responsive design approach
- Design follows Korean-language aesthetic with Noto Sans KR and Inter fonts

**State Management:**
- React Query (TanStack Query) for server state and caching
- Local component state via React hooks
- LocalStorage for persisting analysis data between steps (facialFeatures, surveyAnswers, analysisResult)

**Key Libraries:**
- Framer Motion for animations and transitions
- html2canvas for result card image generation
- React Hook Form with Zod resolvers for form validation

### AI & Machine Learning Architecture

**Client-Side Facial Analysis:**
- TensorFlow.js for browser-based machine learning
- MediaPipe FaceMesh model for facial landmark detection
- Extracts features including: eyebrow angle, lip curvature, jawline angle, face width ratio, eye distance
- Classifies user into animal types based on facial proportions
- All processing happens in-browser; images never leave the client

**Client-Side LLM:**
- WebLLM (@mlc-ai/web-llm) for local language model inference
- Uses WebGPU for accelerated model execution
- Models: TinyLlama-1.1B or Qwen variants
- Generates personality reports based on facial features and survey responses
- Loading progress tracked and displayed to users

**Analysis Pipeline:**
1. User uploads photo → facial feature extraction (client-side)
2. User completes 10-question survey → emotion score calculation
3. Combined data sent to local LLM → personality report generation
4. Results displayed with shareable image cards

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- ESM module system
- Minimal API surface - most logic is client-side

**Development vs Production:**
- Development: Vite dev server with HMR via middleware mode
- Production: Static file serving of built client assets
- Replit-specific plugins for error overlay and cartographer

**Storage Interface:**
- Abstract IStorage interface for CRUD operations
- In-memory implementation (MemStorage) for user data
- Prepared for database integration via schema definitions

### Data Models & Schemas

**Type System:**
- Shared TypeScript types between client and server via `shared/schema.ts`
- Zod schemas for runtime validation
- Core types: PersonalityType (teto/egen/tegen), AnimalType (dog/cat/fox/rabbit/bear/deer)

**Data Structures:**
- FacialFeatures: numerical measurements from face analysis
- SurveyAnswer: question ID and A/B response pairs
- AnalysisResult: combines personality type, animal type, emotion score, and source data
- PersonalityReport: AI-generated text analysis with title, summary, physiognomy, keywords, dating style

**Survey Questions:**
- 10 predefined questions with emotion weights
- Natural language questions avoiding MBTI terminology
- Binary choice (A/B) format
- Weights used to calculate emotion score (0-1 scale)

### External Dependencies

**Frontend Dependencies:**
- @tensorflow/tfjs & @tensorflow-models/face-landmarks-detection: Browser-based facial analysis
- @mlc-ai/web-llm: Client-side LLM inference with WebGPU
- @mediapipe/face_mesh: Google's face mesh model for landmark detection
- @tanstack/react-query: Server state management and caching
- @radix-ui/*: Accessible UI component primitives (accordion, dialog, dropdown, etc.)
- framer-motion: Animation library
- html2canvas: Screenshot/image generation from DOM elements
- wouter: Lightweight routing
- tailwindcss: Utility-first CSS framework
- react-hook-form & @hookform/resolvers: Form state management
- zod: Schema validation

**Backend Dependencies:**
- express: Web server framework
- vite: Build tool and dev server
- tsx: TypeScript execution for development
- esbuild: Production bundling
- @replit/vite-plugin-*: Replit-specific development tooling

**Database (Prepared):**
- drizzle-orm & drizzle-kit: Type-safe ORM and migrations
- @neondatabase/serverless: PostgreSQL driver for serverless environments
- Database schema defined but not actively used (prepared for future persistence)

**Styling & Assets:**
- Google Fonts: Noto Sans KR (Korean), Inter (UI elements)
- Custom color palette with pastel pink primary theme
- Light mode only (no dark mode required per design guidelines)