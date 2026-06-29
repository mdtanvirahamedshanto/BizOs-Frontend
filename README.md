# BizOs - Web Frontend 💻

The web-based administration panel and Point of Sale (POS) system for BizOs. Built with **Next.js**, **React**, and **TailwindCSS**, this application provides a robust, responsive, and feature-rich interface for business owners to manage their operations efficiently.

## Features ✨

- **Comprehensive Dashboard**: View real-time analytics, sales history, and business metrics.
- **Web Point of Sale (POS)**: Full-featured checkout interface with barcode scanner support, discount management, and receipt generation.
- **Progressive Web App (PWA)**: Installable on desktop and mobile browsers, featuring offline-sync capabilities for uninterrupted business operations.
- **Inventory Management**: Detailed product tracking, stock adjustments, and low-stock alerts.
- **Role-Based Access Control**: Secure login and permission management for different employee roles.
- **Report Generation**: Export sales, expenses, and inventory data to PDF or Excel.

## Getting Started 🚀

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   Copy `.env.example` to `.env.local` and set your API base URL.
   ```bash
   cp .env.example .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production 📦

To create an optimized production build:
```bash
npm run build
npm start
```

## Tech Stack 🛠️

- **Framework**: Next.js (App Router), React
- **Styling**: Tailwind CSS, class-variance-authority, clsx
- **State & Data Fetching**: React Query, Zustand
- **Forms & Validation**: React Hook Form, Zod
- **Icons**: Lucide React
- **PWA Capabilities**: Service Workers, IndexedDB
