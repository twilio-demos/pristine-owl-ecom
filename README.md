# Lawson Reinhardt - Premium Ecommerce Website (Next.js)

![Lawson Reinhardt Logo](public/static/lawson-reinhardt-logo.png)

A modern, responsive ecommerce website built with **Next.js** and deployable on **Vercel**, specializing in premium shoes and apparel. This is a refactored version of the original Hono/Cloudflare application.

## 🎨 Brand Identity

**Lawson Reinhardt** features a unique logo design that combines elements from both Twilio and Segment CDP logos, representing the fusion of customer communication and data analytics in modern ecommerce.

## 🌟 Project Overview

**Lawson Reinhardt** is a full-featured mock ecommerce website built with **Next.js 15** and **React 18**, showcasing modern web development practices with server-side rendering and API routes.

### ✨ Key Features

- **🏠 Home Page** - Server-side rendered with featured products
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS
- **🛍️ Product Collections** - Dynamic routes for categories (New Arrivals, Men, Women, Shoes, Apparel)
- **🔐 Authentication System** - Cookie-based session management with Next.js API routes
- **🛒 Shopping Cart** - Real-time cart updates with local storage integration
- **💳 Checkout Flow** - Complete payment flow with form validation
- **📊 Segment Integration** - Customer analytics and profile tracking
- **🔍 Algolia Search** - Real-time product search and filtering

## 🌍 Live URLs

- **Development**: https://3001-ink8fa98af0g9ixqexric-6532622b.e2b.dev
- **GitHub Repository**: https://github.com/twilio-demos/pristine-owl-ecom

### Available Pages & API Endpoints

**Main Pages:**
- `/` - Home page with hero section and featured products
- `/collections/[category]` - Dynamic collection pages
- `/login` - User authentication
- `/register` - Account creation
- `/checkout` - Purchase flow

**API Routes (Next.js):**
- `GET /api/auth/status` - Check authentication status
- `POST /api/login` - User authentication
- `POST /api/register` - Account creation
- `POST /api/logout` - Sign out
- `GET /api/products` - Products API with category filtering
- `GET /api/products/[id]` - Individual product details
- `GET /api/cart` - Shopping cart contents
- `POST /api/cart` - Add items to cart
- `PUT /api/cart/[productId]` - Update cart quantities
- `DELETE /api/cart/[productId]` - Remove from cart
- `POST /api/checkout` - Process orders
- `GET /api/profile/[anonymousId]/traits` - Segment Profile traits
- `GET /api/profile/[anonymousId]/events` - Segment Profile events
- `GET /api/profile/[anonymousId]/identities` - Segment Profile identities

## 🚀 Technical Architecture

### Tech Stack
- **Frontend**: Next.js 15 + React 18
- **Styling**: Tailwind CSS 3.3
- **TypeScript**: Full type safety
- **Authentication**: Cookie-based sessions
- **Search**: Algolia InstantSearch.js
- **Analytics**: Segment Analytics
- **Deployment**: Vercel (production ready)
- **Development**: Next.js Dev Server

### Project Structure
```
webapp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── collections/       # Collection pages
│   │   ├── login/             # Authentication
│   │   ├── register/          # Registration
│   │   ├── checkout/          # Checkout flow
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions and data
│   └── types/                 # TypeScript type definitions
├── public/
│   └── static/                # Static assets (images, CSS, JS)
├── .env                       # Environment variables
├── .env.example               # Environment template
├── next.config.mjs            # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment configuration
└── package.json               # Dependencies and scripts
```

## 📦 Installation & Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone the repository
git clone https://github.com/twilio-demos/pristine-owl-ecom.git
cd pristine-owl-ecom

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Segment credentials

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables
```bash
# Segment Configuration
SEGMENT_SPACE_ID=your_segment_space_id
PROFILE_API_KEY=your_profile_api_key
SEGMENT_BASE_URL=https://profiles.segment.com

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here
```

## 📊 Data Architecture

### Product Data Model
The application uses **Algolia** for product search and filtering:

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: 'men' | 'women' | 'shoes' | 'apparel';
  subcategory: string;
  image: string;
  isNewArrival: boolean;
  isFeatured: boolean;
  sizes: string[];
  colors: string[];
  description: string;
}
```

### Storage & State Management
- **Product Catalog**: Algolia real-time search results
- **User Sessions**: Server-side cookie-based sessions
- **Cart System**: Client-side localStorage + server-side synchronization
- **Authentication**: In-memory session storage (demo) / Redis recommended for production

### Demo Credentials
- **Email**: `demo@example.com`
- **Password**: `password123`

## 🎯 User Guide

### Shopping Experience
1. **Browse Products**: Navigate collections or view featured items
2. **Add to Cart**: Click "Add to Cart" on product cards
3. **View Cart**: Cart sidebar with real-time updates
4. **Checkout**: Complete purchase with demo payment info
5. **Authentication**: Login with demo credentials

### Interactive Features
- **Server-Side Rendering**: Fast initial page loads
- **Client-Side Navigation**: Smooth page transitions with Next.js Router
- **Real-time Search**: Algolia-powered product filtering
- **Cart Management**: Add/remove items with quantity controls
- **Form Validation**: Client-side validation on all forms
- **Analytics Tracking**: Segment integration for user behavior analysis

## ☁️ Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Deploy to Vercel
   vercel
   ```

2. **Environment Variables**:
   Set environment variables in Vercel dashboard:
   - `SEGMENT_SPACE_ID`
   - `PROFILE_API_KEY` 
   - `SEGMENT_BASE_URL`

3. **Deploy**:
   ```bash
   # Deploy to production
   vercel --prod
   ```

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🔄 Migration Notes

This application has been **refactored from Hono/Cloudflare Pages to Next.js/Vercel**:

### Key Changes
- **Framework**: Hono → Next.js 15
- **Runtime**: Cloudflare Workers → Node.js/Vercel
- **Routing**: Hono routes → Next.js App Router
- **Components**: Hono JSX → React components
- **APIs**: Hono handlers → Next.js API routes
- **Deployment**: Cloudflare Pages → Vercel
- **Static Files**: Cloudflare assets → Next.js public folder

### Preserved Features
- ✅ All original functionality maintained
- ✅ Segment Profile API integration
- ✅ Algolia search and pagination
- ✅ Shopping cart and checkout
- ✅ Authentication system
- ✅ Analytics tracking
- ✅ Responsive design
- ✅ Static assets and styling

## 📊 Current Status

### ✅ Completed Features
- [x] **Complete Next.js Migration**: Full refactor from Hono to Next.js
- [x] **Next.js App Router**: Modern routing with layouts and server components
- [x] **API Routes**: All backend functionality converted to Next.js API routes
- [x] **React Components**: Interactive UI with proper state management
- [x] **TypeScript Integration**: Full type safety across the application
- [x] **Vercel Deployment**: Production-ready deployment configuration
- [x] **Segment Integration**: Customer analytics and profile tracking
- [x] **Algolia Search**: Real-time product search and filtering
- [x] **Authentication Flow**: Cookie-based session management
- [x] **Shopping Cart**: Complete cart functionality
- [x] **Checkout Process**: Full payment flow
- [x] **Responsive Design**: Mobile-first Tailwind CSS implementation

### 🎯 Production Ready
- **Framework**: Next.js 15 (Latest stable)
- **Deployment**: Vercel optimized
- **Performance**: Server-side rendering + static generation
- **SEO**: Proper meta tags and structured data
- **Analytics**: Segment tracking integration
- **Search**: Algolia InstantSearch implementation

### 🔧 Development Workflow
```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start           # Start production server

# Linting & Type Checking
npm run lint        # ESLint checking
npx tsc             # TypeScript compilation check
```

## 🌟 Next.js Benefits

### Performance
- **Server-Side Rendering**: Faster initial page loads
- **Static Generation**: Pre-built pages for optimal performance
- **Image Optimization**: Automatic image optimization and lazy loading
- **Bundle Splitting**: Automatic code splitting for faster navigation

### Developer Experience  
- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety and IntelliSense
- **API Routes**: Full-stack development in one framework
- **File-based Routing**: Intuitive routing based on file structure

### Deployment
- **Vercel Integration**: Seamless deployment with zero configuration
- **Edge Functions**: API routes run on Vercel's edge network
- **Automatic Scaling**: Handle traffic spikes automatically
- **Environment Variables**: Secure configuration management

---

*Refactored to Next.js 15 for modern web development with enhanced performance, developer experience, and deployment capabilities.*