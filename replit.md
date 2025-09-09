# Character Mapping Tool

## Overview

A web application for converting text between different character sets and scripts, with specialized support for Gujarati script conversion. The tool provides a user-friendly interface for creating custom character mapping rules, real-time text conversion, file import/export capabilities, and advanced configuration options. Built to handle complex Unicode normalization and character positioning, particularly for Gujarati text processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management with local component state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with CRUD operations for mapping rules and configurations
- **Storage**: In-memory storage with interface for future database integration
- **File Upload**: Multer middleware for JSON mapping file imports
- **Development**: Custom Vite integration for hot module replacement

### Data Storage Solutions
- **ORM**: Drizzle ORM with PostgreSQL schema definitions
- **Database**: Configured for Neon Database (PostgreSQL-compatible)
- **Schema**: Two main tables - mapping_rules and mapping_configurations
- **Validation**: Drizzle-Zod integration for type-safe database operations
- **Current Implementation**: In-memory storage with database interface for future migration

### Authentication and Authorization
- **Current State**: No authentication implemented
- **Session Management**: Express session configuration present but not actively used
- **Future Ready**: Infrastructure prepared for user authentication and session-based access control

### Text Processing Engine
- **Unicode Handling**: Advanced Gujarati text normalization with proper vowel positioning
- **Character Mapping**: Real-time conversion engine with case sensitivity support
- **Text Statistics**: Character, word, and line counting with conversion metrics
- **File Processing**: JSON-based mapping rule import/export with validation

## External Dependencies

### Database Services
- **Neon Database**: PostgreSQL-compatible serverless database
- **Connection**: @neondatabase/serverless driver for database connectivity

### UI and Component Libraries
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant creation for components

### Development and Build Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment optimizations and error reporting

### Text Processing Libraries
- **Shared Utilities**: Custom Gujarati text normalization and Unicode handling
- **File Handling**: JSON parsing and validation for mapping configurations
- **Character Mapping**: Custom conversion engine with rule-based transformations

### State Management and API
- **TanStack Query**: Server state synchronization and caching
- **Wouter**: Minimal routing solution for single-page application
- **Zod**: Runtime type validation for API requests and responses