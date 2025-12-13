# 🚴 AKL Bicycles - عقل للدراجات الهوائية

<div align="center">
  <img src="/imgs/akl_ecommerce_view.png" alt="AKL E-commerce Application Preview" width="100%" style="border-radius: 8px; margin-bottom: 20px;" />
</div>

A modern, full-featured e-commerce platform built with Next.js 16, designed specifically for selling bicycles, kids' cars, baby products, and scooters. The application features bilingual support (Arabic/English), comprehensive admin dashboard, secure authentication, and a seamless shopping experience.

## ✨ Features

### 🛍️ E-commerce Features
- **Product Catalog**: Browse products by categories with advanced filtering and search
- **Product Details**: Detailed product pages with images, descriptions, and variants
- **Shopping Cart**: Add to cart functionality with persistent cart state
- **Checkout Process**: Complete order placement with customer information
- **Order Management**: View order history and track orders
- **Category Browsing**: Navigate products by categories with dedicated category pages

### 🌐 Internationalization
- **Bilingual Support**: Full Arabic (RTL) and English (LTR) language support
- **Dynamic Routing**: Locale-based routing (`/ar` and `/en`)
- **RTL/LTR Layout**: Automatic layout direction based on selected language

### 🔐 Authentication & Security
- **Multiple Auth Providers**: 
  - Email/Password authentication with email verification
  - Google OAuth integration
- **Secure Sessions**: JWT-based session management with NextAuth.js
- **Email Verification**: Email verification system for new registrations
- **Password Security**: Bcrypt password hashing

### 👨‍💼 Admin Dashboard
- **Product Management**: Create, read, update, and delete products
- **Category Management**: Manage product categories
- **Order Management**: View and manage customer orders
- **Settings**: Configure site settings
- **Analytics Dashboard**: View statistics (products, categories, orders, revenue)

### 🎨 User Experience
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Responsive Design**: Fully responsive across all devices
- **Smooth Animations**: Framer Motion animations for enhanced UX
- **Loading States**: Optimistic UI updates and loading indicators
- **Toast Notifications**: User-friendly notifications with Sonner

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Zustand** - State management
- **next-intl** - Internationalization

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - Database with Mongoose ODM
- **NextAuth.js v5** - Authentication
- **bcryptjs** - Password hashing
- **Nodemailer** - Email sending

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or cloud)
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bike-store
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # NextAuth
   NEXTAUTH_SECRET=your_secret_key_here
   NEXTAUTH_URL=http://localhost:3000

   # Admin Credentials
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your_admin_password

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Email Configuration (for email verification)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_app_password
   SMTP_FROM=noreply@yourdomain.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

   The application will default to Arabic (`/ar`). You can access the English version at `/en`.

## 📁 Project Structure

```
bike-store/
├── public/
│   └── imgs/              # Static images
├── src/
│   ├── app/
│   │   ├── [locale]/      # Localized routes
│   │   │   ├── admin/     # Admin dashboard
│   │   │   ├── auth/      # Authentication pages
│   │   │   ├── cart/      # Shopping cart
│   │   │   ├── checkout/  # Checkout page
│   │   │   ├── orders/    # Order history
│   │   │   ├── products/  # Products listing
│   │   │   └── product/   # Product details
│   │   └── api/           # API routes
│   │       ├── admin/     # Admin API endpoints
│   │       ├── auth/      # Authentication API
│   │       ├── orders/    # Orders API
│   │       ├── products/  # Products API
│   │       └── categories/# Categories API
│   ├── components/        # React components
│   │   ├── ui/            # UI components (Radix UI)
│   │   └── ...            # Feature components
│   ├── lib/               # Utility functions
│   │   ├── api/           # API helpers
│   │   ├── stores/        # Zustand stores
│   │   └── auth.ts        # Auth configuration
│   ├── models/            # Mongoose models
│   ├── db/                # Database connection
│   ├── i18n/              # Internationalization config
│   └── types/             # TypeScript types
├── messages/              # Translation files
│   ├── ar.json           # Arabic translations
│   └── en.json           # English translations
└── package.json
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔑 Key Features Explained

### Admin Access
Access the admin dashboard at `/ar/admin` or `/en/admin` using the credentials set in your `.env.local` file:
- Email: `ADMIN_EMAIL`
- Password: `ADMIN_PASSWORD`

### Product Management
- Products support multiple images
- SKU-based product identification
- Stock management
- Category assignment
- Bilingual titles and descriptions
- Product variants support

### Order System
- Complete order tracking
- Order history for users
- Order management for admins
- Revenue tracking

### Internationalization
The app uses `next-intl` for internationalization:
- Default locale: Arabic (`ar`)
- Supported locales: Arabic (`ar`), English (`en`)
- Automatic RTL/LTR layout switching
- Translation files in `messages/` directory

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Make sure to:
- Set all required environment variables
- Configure MongoDB connection string
- Set up email service for verification emails
- Configure OAuth providers if using Google sign-in

## 📝 Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `ADMIN_EMAIL` | Admin login email | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `SMTP_HOST` | SMTP server host | No |
| `SMTP_PORT` | SMTP server port | No |
| `SMTP_USER` | SMTP username | No |
| `SMTP_PASSWORD` | SMTP password | No |
| `SMTP_FROM` | From email address | No |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👥 Support

For support, please contact the development team or open an issue in the repository.

---

<div align="center">
  <p>Built with ❤️ using Next.js and TypeScript</p>
  <p>AKL Bicycles - عقل للدراجات الهوائية</p>
</div>
