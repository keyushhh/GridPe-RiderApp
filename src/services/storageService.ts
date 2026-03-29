import { supabase } from '../lib/supabase';

export const storageService = {
  /**
   * Uploads a base64 image string to a Supabase storage bucket.
   * @param base64 The data URL of the image.
   * @param bucket The name of the storage bucket.
   * @param path The destination path inside the bucket.
   * @returns The public URL of the uploaded image.
   */
  async uploadBase64Image(base64: string, bucket: string, path: string): Promise<string> {
    try {
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64.split(',')[1];
      
      // Convert base64 to Blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      // Upload to Supabase
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error('Storage upload error:', error);
      throw error;
    }
  }
};
