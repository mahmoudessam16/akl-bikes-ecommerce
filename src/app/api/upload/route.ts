import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'إعدادات Cloudinary غير موجودة' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'لم يتم إرسال ملف' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'الملف يجب أن يكون صورة' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'حجم الملف كبير جداً. الحد الأقصى 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder || 'bike-store',
          resource_type: 'image',
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const result = uploadResult as any;

    return NextResponse.json(
      {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء رفع الصورة' },
      { status: 500 }
    );
  }
}

// Handle URL upload (for existing URLs that need to be uploaded to Cloudinary)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول' },
        { status: 401 }
      );
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'إعدادات Cloudinary غير موجودة' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { url, folder } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'الرابط مطلوب' },
        { status: 400 }
      );
    }

    // Skip if already a Cloudinary URL
    if (url.includes('res.cloudinary.com')) {
      return NextResponse.json(
        { url, message: 'الصورة موجودة بالفعل على Cloudinary' },
        { status: 200 }
      );
    }

    // Upload from URL to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(url, {
      folder: folder || 'bike-store',
      resource_type: 'image',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('URL upload error:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء رفع الصورة من الرابط' },
      { status: 500 }
    );
  }
}
