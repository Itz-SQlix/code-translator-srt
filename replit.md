# CodeTranslate - AI-Powered Code Translation Platform

## Overview

CodeTranslate is a modern web application that translates code between different programming languages using AI. The platform supports C++, Python, Java, and JavaScript, providing intelligent context-aware translations with explanations. Built with a React frontend and Express backend, it features a clean, responsive UI with real-time translation capabilities and translation history management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme and glassmorphism design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with JSON responses
- **Request Validation**: Zod schemas for type-safe validation
- **Data Storage**: In-memory storage with interface for future database integration
- **Development**: Hot reload with Vite middleware integration

### Data Layer
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Type-safe database schema with Zod integration
- **Storage Interface**: Abstracted storage layer supporting both memory and database implementations
- **Migrations**: Drizzle-kit for schema migrations

### AI Integration
- **Provider**: OpenAI GPT-4o for code translation
- **Processing**: Structured prompts with JSON response parsing
- **Features**: Context-aware translation with explanations and best practice adaptations

### Core Features
- **Code Translation**: Multi-language support (C++, Python, Java, JavaScript)
- **Real-time Processing**: Async translation with loading states
- **History Management**: Translation storage and retrieval
- **Responsive Design**: Mobile-first UI with adaptive layouts
- **Error Handling**: Comprehensive error boundaries and user feedback

### Development Environment
- **Hot Reload**: Vite dev server with React Fast Refresh
- **Type Safety**: Full TypeScript coverage with strict mode
- **Code Quality**: Path aliases and consistent file organization
- **Replit Integration**: Custom plugins for development environment

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for intelligent code translation
- **Configuration**: Environment variable-based API key management

### Database Services
- **Neon Database**: Serverless PostgreSQL database
- **Connection**: Environment-based connection string configuration

### UI Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Lucide React**: Comprehensive icon library
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Fast build tool with TypeScript support
- **ESBuild**: JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### Third-party Services
- **Replit Platform**: Development environment with custom banners and cartographer
- **Font Services**: Google Fonts integration for typography