import { getSupabaseAdmin } from './server';

export const SUPABASE_BUCKETS = {
  STUDENT_PHOTOS: 'student-photos',
  ADMISSION_DOCS: 'admission-docs',
  HOMEWORK_ATTACHMENTS: 'homework-attachments',
  STUDY_MATERIALS: 'study-materials',
  CERTIFICATES: 'certificates',
  REPORT_CARDS: 'report-cards',
} as const;

export type SupabaseBucketName = typeof SUPABASE_BUCKETS[keyof typeof SUPABASE_BUCKETS];

/**
 * Initializes and verifies the required storage buckets in Supabase
 */
export async function ensureStorageBuckets(): Promise<{
  success: boolean;
  buckets: Array<{ name: string; exists: boolean; isPublic: boolean }>;
}> {
  const supabase = getSupabaseAdmin();
  const requiredBuckets: Array<{ name: SupabaseBucketName; isPublic: boolean }> = [
    { name: SUPABASE_BUCKETS.STUDENT_PHOTOS, isPublic: true },
    { name: SUPABASE_BUCKETS.ADMISSION_DOCS, isPublic: false },
    { name: SUPABASE_BUCKETS.HOMEWORK_ATTACHMENTS, isPublic: true },
    { name: SUPABASE_BUCKETS.STUDY_MATERIALS, isPublic: true },
    { name: SUPABASE_BUCKETS.CERTIFICATES, isPublic: false },
    { name: SUPABASE_BUCKETS.REPORT_CARDS, isPublic: false },
  ];

  try {
    const listPromise = supabase.storage.listBuckets();
    const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
      setTimeout(() => reject(new Error('Storage request timed out (5s)')), 5000)
    );

    const { data: existingBuckets, error: listError } = await Promise.race([listPromise, timeoutPromise]);
    if (listError) {
      console.warn('Could not list storage buckets:', listError.message);
      return {
        success: false,
        buckets: requiredBuckets.map((b) => ({ name: b.name, exists: false, isPublic: b.isPublic })),
      };
    }

    const results = [];
    const existingNames = new Set((existingBuckets || []).map((b: any) => b.name));

    for (const b of requiredBuckets) {
      if (!existingNames.has(b.name)) {
        const { error: createError } = await supabase.storage.createBucket(b.name, {
          public: b.isPublic,
          fileSizeLimit: 10485760, // 10MB limit
        });
        results.push({
          name: b.name,
          exists: !createError,
          isPublic: b.isPublic,
        });
      } else {
        results.push({
          name: b.name,
          exists: true,
          isPublic: b.isPublic,
        });
      }
    }

    return { success: true, buckets: results };
  } catch (err: any) {
    console.error('Storage bucket initialization error:', err.message);
    return {
      success: false,
      buckets: requiredBuckets.map((b) => ({ name: b.name, exists: false, isPublic: b.isPublic })),
    };
  }
}

/**
 * Uploads a file buffer to a specific Supabase storage bucket
 */
export async function uploadToStorage(
  bucket: SupabaseBucketName,
  filePath: string,
  fileBuffer: Buffer | ArrayBuffer | Uint8Array,
  contentType: string = 'application/octet-stream'
): Promise<{ success: boolean; path?: string; publicUrl?: string; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      success: true,
      path: data.path,
      publicUrl: publicData.publicUrl,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Generates a secure, time-limited signed download URL for private documents
 */
export async function getSecureDownloadUrl(
  bucket: SupabaseBucketName,
  filePath: string,
  expiresInSeconds: number = 3600 // 1 hour
): Promise<{ success: boolean; signedUrl?: string; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, signedUrl: data.signedUrl };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes a file from Supabase storage
 */
export async function deleteFromStorage(
  bucket: SupabaseBucketName,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
