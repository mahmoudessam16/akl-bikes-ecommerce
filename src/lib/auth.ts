// @ts-ignore - NextAuth v5 beta types
import type { NextAuthConfig } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/db/mongoose';
import User from '@/models/User';

const providers = [];

// Add Google provider only if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  try {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    );
  } catch (error) {
    console.error('Error setting up Google provider:', error);
  }
} else {
  console.warn('Google OAuth credentials not found. Google sign-in will not be available.');
}

// Always add Credentials provider
providers.push(
  CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
        }

        const email = typeof credentials.email === 'string' ? credentials.email : String(credentials.email);
        const password = typeof credentials.password === 'string' ? credentials.password : String(credentials.password);

        // Check if it's admin credentials from .env
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (adminEmail && adminPassword && 
            email.toLowerCase() === adminEmail.toLowerCase() &&
            password === adminPassword) {
          // Admin login - check if admin user exists, create if not
          await connectDB();
          
          let adminUser = await User.findOne({ email: adminEmail.toLowerCase() });
          
          if (!adminUser) {
            // Create admin user if doesn't exist
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            adminUser = await User.create({
              name: 'Admin',
              email: adminEmail.toLowerCase(),
              password: hashedPassword,
              provider: 'credentials',
              emailVerified: true, // Admin is auto-verified
            });
          } else {
            // Update admin user to ensure it's verified and has correct provider
            if (!adminUser.emailVerified || adminUser.provider !== 'credentials') {
              await User.findByIdAndUpdate(adminUser._id, {
                emailVerified: true,
                provider: 'credentials',
              });
            }
          }
          
          return {
            id: adminUser._id.toString(),
            email: adminUser.email,
            name: adminUser.name || 'Admin',
            image: adminUser.image,
          };
        }

        // Regular user login
        await connectDB();

        const user = await User.findOne({ email: email }).select('+password');

        if (!user) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        if (user.provider !== 'credentials') {
          throw new Error('يرجى تسجيل الدخول باستخدام Google');
        }

        if (!user.emailVerified) {
          throw new Error('يرجى التحقق من بريدك الإلكتروني أولاً');
        }

        if (!user.password || typeof user.password !== 'string') {
          throw new Error('خطأ في كلمة المرور');
        }
        
        // @ts-ignore - user.password is checked above
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    })
);

// @ts-ignore - NextAuth v5 beta types
export const authOptions: any = {
  providers,
  pages: {
    signIn: '/ar/auth/signin',
    error: '/ar/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // إذا كان URL يبدأ بـ /، أضف baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // إذا كان URL يبدأ بـ baseUrl، استخدمه
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account }: { user: any; account: any }) {
      try {
        // If it's Google provider
        if (account?.provider === 'google') {
          if (!user.email) {
            console.error('Google sign in: user email is missing');
            return '/ar/auth/error?error=Configuration';
          }

          try {
            await connectDB();
          } catch (dbError: any) {
            console.error('Database connection error:', dbError);
            return '/ar/auth/error?error=Configuration';
          }
          
          try {
            const existingUser = await User.findOne({ email: user.email.toLowerCase() });
            
            if (existingUser) {
              // Update user if they exist
              if (existingUser.provider !== 'google') {
                // Convert credentials user to google user
                await User.findByIdAndUpdate(existingUser._id, {
                  provider: 'google',
                  emailVerified: true,
                  image: user.image,
                });
              } else if (user.image && existingUser.image !== user.image) {
                // Update image if changed
                await User.findByIdAndUpdate(existingUser._id, {
                  image: user.image,
                });
              }
              return true;
            }
            
            // Create new user
            const newUser = await User.create({
              name: user.name || 'User',
              email: user.email.toLowerCase(),
              image: user.image,
              provider: 'google',
              emailVerified: true, // Google accounts are already verified
            });
            
            if (!newUser) {
              console.error('Failed to create user');
              return '/ar/auth/error?error=Configuration';
            }
            
            return true;
          } catch (userError: any) {
            console.error('User creation/update error:', userError);
            // If it's a duplicate key error, user already exists, allow sign in
            if (userError.code === 11000) {
              return true;
            }
            return '/ar/auth/error?error=Configuration';
          }
        }
        
        // For credentials provider, always allow (authorize function handles validation)
        return true;
      } catch (error: any) {
        console.error('SignIn callback error:', error);
        // Return error page URL instead of false
        return '/ar/auth/error?error=Configuration';
      }
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      try {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.image = user.image;
        }
        return token;
      } catch (error: any) {
        console.error('JWT callback error:', error);
        return token;
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      try {
        if (session?.user && token) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.image = token.image as string;
        }
        return session;
      } catch (error: any) {
        console.error('Session callback error:', error);
        return session;
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production-please-change-this',
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === 'production',
  logger: {
    error(code: string, metadata?: any) {
      console.error('NextAuth Error:', code, metadata);
    },
    warn(code: string) {
      console.warn('NextAuth Warning:', code);
    },
    debug(code: string, metadata?: any) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth Debug:', code, metadata);
      }
    },
  },
};

