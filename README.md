# SilverCard - Credit Card Application Management System

A comprehensive credit card application management system with admin and agent dashboards.

## Features

- **Admin Dashboard**: Full access to user management, application review, and system administration
- **Agent Dashboard**: Application management and client data access
- **Application Forms**: Complete credit card application process
- **Real-time Updates**: Live application status tracking
- **Export Functionality**: PDF and Excel export capabilities

## Mock Authentication System

This project now uses a mock authentication system for testing purposes. The Supabase authentication has been disconnected and replaced with local mock accounts.

### Available Test Accounts

#### Admin Account
- **Email**: `admin@silvercard.com`
- **Password**: `admin123`
- **Role**: Admin
- **Access**: Full system access including user management, application review, and administrative functions

#### Moderator Account
- **Email**: `moderator@silvercard.com`
- **Password**: `moderator123`
- **Role**: Moderator
- **Access**: Status reports, user management, application tracking, and bank-specific reports

#### Agent Account
- **Email**: `agent@silvercard.com`
- **Password**: `agent123`
- **Role**: Agent
- **Access**: Application management, client data viewing, and form submissions

#### Encoder Account
- **Email**: `encoder@silvercard.com`
- **Password**: `encoder123`
- **Role**: Encoder
- **Access**: Application submission and tracking

### How to Login

1. Navigate to the login page (`/login`)
2. Click "Show Test Accounts" to see available credentials
3. Click on any account card to auto-fill the login form
4. Click "Sign In" to access the dashboard

### Features by Role

#### Admin Dashboard Features
- **Dashboard Overview**: Application statistics and recent activity
- **Status Report**: Bank-specific application status tracking
- **Client Applications**: Review and manage all applications
- **Application History**: View and export application records with encoder tracking

#### Moderator Dashboard Features
- **Dashboard Overview**: Application statistics and recent activity
- **Status Report**: Bank-specific application status tracking
- **Client Applications**: Review and manage all applications
- **Application History**: View and export application records with encoder tracking
- **User Management**: Create, edit, and delete user accounts

#### Agent Dashboard Features
- **Dashboard Overview**: Personal application statistics
- **Application History**: View submitted applications
- **Client Data**: Access to client information and documents

#### Encoder Dashboard Features
- **Dashboard Overview**: Application statistics and tracking (shows only applications encoded by the current encoder)
- **Apply**: Submit new credit card applications with agent selection (mock data)
- **Application History**: View and track applications encoded by the current encoder (mock data)

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

4. Go to `/login` and use one of the test accounts above

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AdminDashboard.tsx
│   ├── AgentDashboard.tsx
│   ├── ApplicationForm.tsx
│   └── ...
├── context/            # React context providers
│   ├── AuthContext.tsx  # Mock authentication
│   ├── ApplicationContext.tsx
│   └── LoadingContext.tsx
├── pages/              # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   └── ...
└── types/              # TypeScript type definitions
    └── index.ts
```

## Mock Data

The system includes mock data for testing:
- User accounts (admin and agent roles)
- Application data stored in localStorage
- Simulated network delays for realistic UX

## Security Note

⚠️ **Important**: This is a development/testing system with mock authentication. The credentials are hardcoded and should never be used in production. For production deployment, implement proper authentication and security measures.

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: React Router DOM
- **PDF Generation**: jsPDF, html2canvas
- **Excel Export**: XLSX

## License

This project is for demonstration and testing purposes only.