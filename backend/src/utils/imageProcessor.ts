import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export class ImageProcessor {
    private readonly uploadDir = path.join(process.cwd(), 'uploads');

    async initialize() {
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    public async processAndStoreImage(
        base64Image: string,
        email: string,
        type: 'ENTRY' | 'EXIT',
        timestamp: Date
    ): Promise<{ imagePath: string; processedImage: string }> {
        // Remove data URL prefix
        const base64Data = base64Image.replace(
            /^data:image\/[a-z]+;base64,/,
            ''
        );

        // Create filename with metadata
        const dateStr = timestamp.toISOString().split('T')[0];
        const timeStr = timestamp.toISOString().replace(/[:.]/g, '-');
        const filename = `${email}_${type}_${dateStr}_${timeStr}.jpg`;
        const filePath = path.join(this.uploadDir, filename);

        try {
            // Process image with sharp for optimization
            const processedBuffer = await sharp(
                Buffer.from(base64Data, 'base64')
            )
                .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toBuffer();

            // Save processed image to file
            fs.writeFileSync(filePath, processedBuffer);

            // Convert back to base64 for storage
            const processedBase64 = `data:image/jpeg;base64,${processedBuffer.toString(
                'base64'
            )}`;

            return {
                imagePath: filename,
                processedImage: processedBase64,
            };
        } catch (error) {
            console.error('Error processing image:', error);
            throw new Error('Failed to process image');
        }
    }

    async compareImages(image1: string, image2: string): Promise<number> {
        try {
            // Remove data URL prefixes
            const base64Data1 = image1.replace(
                /^data:image\/[a-z]+;base64,/,
                ''
            );
            const base64Data2 = image2.replace(
                /^data:image\/[a-z]+;base64,/,
                ''
            );

            // Convert to buffers
            const buffer1 = Buffer.from(base64Data1, 'base64');
            const buffer2 = Buffer.from(base64Data2, 'base64');

            // Process images to same size for comparison
            const processed1 = await sharp(buffer1)
                .resize(100, 100, { fit: 'cover' })
                .grayscale()
                .raw()
                .toBuffer();

            const processed2 = await sharp(buffer2)
                .resize(100, 100, { fit: 'cover' })
                .grayscale()
                .raw()
                .toBuffer();

            // Calculate similarity (simple pixel-by-pixel comparison)
            let similarity = 0;
            const totalPixels = processed1.length;

            for (let i = 0; i < totalPixels; i++) {
                const diff = Math.abs(processed1[i] - processed2[i]);
                similarity += (255 - diff) / 255;
            }

            return similarity / totalPixels;
        } catch (error) {
            console.error('Error comparing images:', error);
            return 0;
        }
    }

    getImagePath(filename: string): string {
        return path.join(this.uploadDir, filename);
    }

    deleteImage(filename: string): boolean {
        try {
            const filePath = this.getImagePath(filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting image:', error);
            return false;
        }
    }
}
