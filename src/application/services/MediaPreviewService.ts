import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sharp: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSharp(): Promise<any> {
  if (!sharp) {
    try {
      const sharpModule = await import('sharp');
      sharp = sharpModule.default;
    } catch (error) {
      console.warn('Sharp not available, falling back to basic image handling:', error);
      return null;
    }
  }
  return sharp;
}

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

    const previewName = `${fileName.replace(/\.[^/.]+$/, '')}_preview.jpg`;
    const previewPath = join(process.cwd(), this.PREVIEW_DIR, previewName);

    try {
      if (mimeType.startsWith('image/')) {
        return await this.generateImagePreview(filePath, previewPath);
      } else if (mimeType.startsWith('video/')) {
        return await this.generateVideoPreview(filePath, previewPath);
      } else if (mimeType === 'application/pdf') {
        return await this.generatePdfPreview(filePath, previewPath);
      }

      return null;
    } catch (error) {
      console.error('Preview generation error:', error);
      return null;
    }
  }

  private static async generateImagePreview(sourcePath: string, previewPath: string): Promise<string> {
    const sharpInstance = await getSharp();

    if (sharpInstance) {
      try {
        await sharpInstance(sourcePath)
          .resize(this.THUMBNAIL_SIZE, this.THUMBNAIL_SIZE, {
            fit: 'cover',
            position: 'center'
          })
          .jpeg({ quality: 85 })
          .toFile(previewPath);

        return previewPath;
      } catch (error) {
        console.warn('Sharp processing failed, falling back to copy:', error);
      }
    }

    return await this.copyImageAsPreview(sourcePath, previewPath);
  }

  private static async copyImageAsPreview(sourcePath: string, previewPath: string): Promise<string> {
    const imageData = await readFile(sourcePath);
    await writeFile(previewPath, imageData);
    return previewPath;
  }

  private static async generateVideoPreview(sourcePath: string, previewPath: string): Promise<string> {
    try {
      try {
        await execAsync('ffmpeg -version');
      } catch (ffmpegError) {
        console.warn('FFmpeg not available, creating placeholder:', ffmpegError);
        return await this.createVideoPlaceholder(previewPath);
      }

      const command = `ffmpeg -i "${sourcePath}" -ss 00:00:01 -vframes 1 -vf "scale=${this.THUMBNAIL_SIZE}:${this.THUMBNAIL_SIZE}:force_original_aspect_ratio=increase,crop=${this.THUMBNAIL_SIZE}:${this.THUMBNAIL_SIZE}" -y "${previewPath}" 2>/dev/null`;

      await execAsync(command);

      const fs = await import('fs');
      if (!fs.existsSync(previewPath)) {
        throw new Error('FFmpeg did not generate output file');
      }

      return previewPath;
    } catch (error) {
      console.error('FFmpeg error:', error);
      return await this.createVideoPlaceholder(previewPath);
    }
  }

  private static async generatePdfPreview(sourcePath: string, previewPath: string): Promise<string> {
    try {
      const command = `convert "${sourcePath}[0]" -thumbnail ${this.THUMBNAIL_SIZE}x${this.THUMBNAIL_SIZE} -background white -alpha remove "${previewPath}"`;

      await execAsync(command);
      return previewPath;
    } catch (error) {
      console.error('PDF conversion error:', error);
      return await this.createDocumentPlaceholder(previewPath);
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

  private static async createDocumentPlaceholder(previewPath: string): Promise<string> {
    const svgContent = `<svg width="${this.THUMBNAIL_SIZE}" height="${this.THUMBNAIL_SIZE}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <g transform="translate(${this.THUMBNAIL_SIZE/2},${this.THUMBNAIL_SIZE/2})">
        <rect x="-25" y="-30" width="50" height="40" fill="#d1d5db" stroke="#9ca3af" stroke-width="2" rx="3"/>
        <rect x="-20" y="-25" width="40" height="2" fill="#6b7280"/>
        <rect x="-20" y="-20" width="30" height="2" fill="#6b7280"/>
        <rect x="-20" y="-15" width="35" height="2" fill="#6b7280"/>
        <rect x="-20" y="-10" width="25" height="2" fill="#6b7280"/>
      </g>
      <text x="${this.THUMBNAIL_SIZE/2}" y="${this.THUMBNAIL_SIZE - 20}" font-family="Arial" font-size="12" text-anchor="middle" fill="#6b7280">PDF</text>
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
