import { supabase } from '../supabase';

export async function uploadToStorage(params: {
  bucket: string;
  fileName: string;
  buffer: Buffer;
  mimeType: string;
}): Promise<string> {
  const { error } = await supabase.storage
    .from(params.bucket)
    .upload(params.fileName, params.buffer, {
      contentType: params.mimeType,
      upsert: true,
    });

  if (error) throw new Error('STORAGE_UPLOAD_FAILED');

  const { data } = supabase.storage.from(params.bucket).getPublicUrl(params.fileName);
  return data.publicUrl;
}
