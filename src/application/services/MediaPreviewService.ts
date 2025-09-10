import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join, extname } from 'path';

const execAsync = promisify(exec);

export class MediaPreviewService {
  private static readonly PREVIEW_DIR = 'uploads/previews';
  private static readonly THUMBNAIL_SIZE = 200;

  static async ensurePreviewDir() {
    try {
      await access(join(process.cwd(), this.PREVIEW_DIR));
    } catch {
      await mkdir(join(process.cwd(), this.PREVIEW_DIR), { recursive: true });
    }
  }

  static async generatePreview(filePath: string, fileName: string, mimeType: string): Promise<string | null> {
    await this.ensurePreviewDir();

    const fileExt = extname(fileName).toLowerCase();
    const previewName = `${fileName.replace(/\.[^/.]+$/, '')}_preview.jpg`;
    const previewPath = join(process.cwd(), this.PREVIEW_DIR, previewName);

    try {
      if (mimeType.startsWith('image/')) {
        // TODO: Add sharp for proper thumbnail generation
        return await this.copyImageAsPreview(filePath, previewPath);
      } else if (mimeType.startsWith('video/')) {
        return await this.generateVideoPreview(filePath, previewPath);
      }

      return null;
    } catch (error) {
      console.error('Preview generation error:', error);
      return null;
    }
  }

  private static async copyImageAsPreview(sourcePath: string, previewPath: string): Promise<string> {
    // Simple copy for now - TODO: implement proper resizing with sharp
    const imageData = await readFile(sourcePath);
    await writeFile(previewPath, imageData);
    return previewPath;
  }

  private static async generateVideoPreview(sourcePath: string, previewPath: string): Promise<string> {
    try {
      const command = `ffmpeg -i "${sourcePath}" -ss 00:00:01 -vframes 1 -vf "scale=${this.THUMBNAIL_SIZE}:${this.THUMBNAIL_SIZE}:force_original_aspect_ratio=increase,crop=${this.THUMBNAIL_SIZE}:${this.THUMBNAIL_SIZE}" -y "${previewPath}"`;

      await execAsync(command);
      return previewPath;
    } catch (error) {
      console.error('FFmpeg error:', error);
      return await this.createVideoPlaceholder(previewPath);
    }
  }

  private static async createVideoPlaceholder(previewPath: string): Promise<string> {
    const svgContent = `<svg width="${this.THUMBNAIL_SIZE}" height="${this.THUMBNAIL_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <g transform="translate(${this.THUMBNAIL_SIZE/2},${this.THUMBNAIL_SIZE/2})">
        <circle fill="#9ca3af" r="30"/>
        <polygon fill="white" points="-10,-15 -10,15 20,0"/>
      </g>
      <text x="${this.THUMBNAIL_SIZE/2}" y="${this.THUMBNAIL_SIZE - 20}" font-family="Arial" font-size="12" text-anchor="middle" fill="#6b7280">VIDEO</text>
    </svg>`;

    await writeFile(previewPath, svgContent);
    return previewPath;
  }

  static getPreviewPath(fileName: string): string {
    const previewName = `${fileName.replace(/\.[^/.]+$/, '')}_preview.jpg`;
    return join(process.cwd(), this.PREVIEW_DIR, previewName);
  }

  static async hasPreview(fileName: string): Promise<boolean> {
    try {
      const previewPath = this.getPreviewPath(fileName);
      await access(previewPath);
      return true;
    } catch {
      return false;
    }
  }
}
