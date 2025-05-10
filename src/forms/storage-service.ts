import { storage } from '../integrations/firebase/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';

export interface UploadedFile {
  fileName: string;
  originalName: string;
  contentType: string;
  size: number;
  url: string;
}

export class StorageService {
  /**
   * Upload a file to Firebase Storage
   * @param file The file buffer
   * @param options Upload options
   * @returns The uploaded file metadata
   */
  async uploadFile(
    fileBuffer: Buffer,
    options: {
      fileName?: string;
      originalName: string;
      contentType: string;
      folder?: string;
    }
  ): Promise<UploadedFile> {
    try {
      // Generate a unique filename if not provided
      const fileName = options.fileName || this.generateUniqueFileName(options.originalName);
      
      // Determine the folder path
      const folderPath = options.folder ? `${options.folder}/` : '';
      
      // Full path in storage including folder
      const fullPath = `${folderPath}${fileName}`;
      
      // Create a temporary file
      const tempFilePath = path.join(os.tmpdir(), fileName);
      fs.writeFileSync(tempFilePath, fileBuffer);
      
      // Get a reference to the storage bucket
      const bucket = storage.bucket();
      
      // Upload the file to storage
      await bucket.upload(tempFilePath, {
        destination: fullPath,
        metadata: {
          contentType: options.contentType,
          metadata: {
            originalName: options.originalName
          }
        }
      });
      
      // Delete the temporary file
      fs.unlinkSync(tempFilePath);
      
      // Make the file publicly accessible
      const file = bucket.file(fullPath);
      await file.makePublic();
      
      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fullPath}`;
      
      // Get file metadata
      const [metadata] = await file.getMetadata();
      
      // Convert size to number (it might be a string in the metadata)
      const fileSize = metadata.size ? Number(metadata.size) : 0;
      
      return {
        fileName: fileName,
        originalName: options.originalName,
        contentType: options.contentType,
        size: fileSize,
        url: publicUrl
      };
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      throw error;
    }
  }
  
  /**
   * Delete a file from Firebase Storage
   * @param filePath The path to the file in storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const bucket = storage.bucket();
      await bucket.file(filePath).delete();
    } catch (error) {
      console.error('Error deleting file from Firebase Storage:', error);
      throw error;
    }
  }
  
  /**
   * Generate a unique file name to avoid overwrites
   * @param originalName The original file name
   * @returns A unique file name
   */
  private generateUniqueFileName(originalName: string): string {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    
    return `${baseName}-${timestamp}-${random}${ext}`;
  }
} 