# Alumni Hub Frontend

A modern Next.js 16 web application for managing engineering alumni networks with a beautiful, responsive UI.

## Overview

Alumni Hub Frontend is a full-featured dashboard application for managing alumni (batchmates) across multiple engineering fields. Built with cutting-edge technologies:

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautiful, customizable components

## Features

- **Dashboard** - Overview of alumni statistics across engineering fields
- **Batchmate Management** - CRUD operations for alumni records
- **Advanced Search** - Filter and search alumni by multiple criteria
- **Bulk Import** - Import multiple records from CSV/Excel
- **Reports & PDF Export** - Generate printable reports
- **User Management** - Role-based access control (Super Admin / Field Admin)
- **Notifications** - Real-time system notifications
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, professional interface

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **pnpm** (recommended) or npm
- **Backend API**: Alumni Hub Backend running on `http://localhost:1337`

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:1337/api
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open the application**
   Navigate to `http://localhost:3000`

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

## Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Dashboard route group
│   │   ├── dashboard/
│   │   │   ├── page.tsx      # Main dashboard
│   │   │   ├── batchmates/   # Batchmate management
│   │   │   ├── bulk-import/  # Bulk import feature
│   │   │   ├── full-view/    # Full alumni view
│   │   │   ├── reports/      # Reports & exports
│   │   │   ├── search/       # Advanced search
│   │   │   └── users/        # User management
│   │   └── layout.tsx        # Dashboard layout
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home redirect
│   └── globals.css           # Global styles
├── components/
│   ├── dashboard/            # Dashboard-specific components
│   │   ├── batchmate-form.tsx
│   │   ├── bulk-import-form.tsx
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ... (40+ components)
│   └── theme-provider.tsx
├── hooks/                    # Custom React hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/                      # Utilities and services
│   ├── api/
│   │   ├── client.ts         # Axios client setup
│   │   └── services/
│   │       ├── batchmate.service.ts
│   │       ├── notification.service.ts
│   │       └── user.service.ts
│   ├── auth-context.tsx      # Authentication context
│   ├── notification-context.tsx
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
├── public/                   # Static assets
├── styles/
│   └── globals.css           # Additional global styles
├── components.json           # shadcn/ui configuration
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── package.json
```

## Authentication

The application uses role-based access control:

### User Roles

| Role | Description | Access |
|------|-------------|--------|
| **Super Admin** | Full system access | All fields, all features |
| **Field Admin** | Field-specific access | Assigned field only |

### Demo Credentials

For testing purposes:

| Email | Password | Role |
|-------|----------|------|
| `superadmin@alumni.com` | `SLTdigitalPlatforms2025@` | Super Admin |
| `computeradmin@alumni.com` | `admin123` | Field Admin (Computer) |
| `civiladmin@alumni.edu` | `admin123` | Field Admin (Civil) |

## UI Components

The application uses [shadcn/ui](https://ui.shadcn.com/) components built on Radix UI:

- **Forms**: Input, Select, Checkbox, Radio, DatePicker
- **Feedback**: Toast, Alert, Dialog, Drawer
- **Data Display**: Table, Card, Badge, Avatar
- **Navigation**: Sidebar, Tabs, Breadcrumb, Pagination
- **Overlays**: Modal, Popover, Dropdown Menu

## Pages & Features

### Dashboard (`/dashboard`)
- Overview statistics (total alumni, countries, workplaces)
- Field-wise distribution chart
- Recent additions
- Quick action buttons

### Batchmates (`/dashboard/batchmates`)
- List all alumni with pagination
- Add new batchmate
- Edit/Delete existing records
- View detailed profile

### Search (`/dashboard/search`)
- Multi-criteria search
- Filter by: name, field, country, workplace
- Export search results

### Bulk Import (`/dashboard/bulk-import`)
- Upload CSV/Excel files
- Preview data before import
- Validation and error handling
- Batch processing

### Reports (`/dashboard/reports`)
- Generate reports by field
- Export to PDF
- Print-friendly layouts
- Statistics summary

### User Management (`/dashboard/users`) - Super Admin Only
- View all system users
- Create new admins
- Assign roles and fields
- Enable/disable accounts

### Full View (`/dashboard/full-view`)
- Complete alumni directory
- Card/List view toggle
- Print-friendly layout

## API Integration

The frontend communicates with the Strapi backend via REST API:

### API Client Configuration

```typescript
// lib/api/client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337/api"
```

### Services

- **batchmateService** - Alumni CRUD operations
- **userService** - User management operations
- **notificationService** - Notification handling

## Engineering Fields Supported

1. Computer Engineering
2. Electrical Engineering
3. Electronics Engineering
4. Mechanical Engineering
5. Civil Engineering
6. Chemical Engineering
7. Material Engineering
8. Mining Engineering
9. Textile Engineering
10. Biomedical Engineering
11. Industrial Engineering
12. Environmental Engineering
13. Aerospace Engineering
14. Software Engineering
15. Data Science
16. Artificial Intelligence

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.0.7 | React framework |
| react | 19.2.0 | UI library |
| axios | 1.13.2 | HTTP client |
| react-hook-form | 7.60.0 | Form handling |
| @hookform/resolvers | 3.10.0 | Form validation |
| date-fns | 4.1.0 | Date utilities |
| lucide-react | 0.454.0 | Icons |
| jspdf | 3.0.4 | PDF generation |
| sonner | Latest | Toast notifications |
| tailwindcss | 3.4.17 | CSS framework |
| zod | 3.24.4 | Schema validation |

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
   ```
4. Deploy

### Manual Build

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## Configuration Files

### next.config.mjs
- Image optimization settings
- API rewrites (if needed)

### tailwind.config.ts
- Custom colors and themes
- Font configurations
- Plugin settings

### components.json
- shadcn/ui component settings
- Style preferences

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend is running on `http://localhost:1337`
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`

2. **Build Errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `pnpm install`

3. **Hydration Errors**
   - Usually caused by browser extensions
   - Check for localStorage usage in SSR components
