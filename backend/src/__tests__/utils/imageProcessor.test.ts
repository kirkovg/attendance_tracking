import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ImageProcessor } from '../../utils/imageProcessor.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Mock the dependencies
jest.mock('sharp');
jest.mock('fs');
jest.mock('path');

describe('ImageProcessor', () => {
    let imageProcessor: ImageProcessor;
    let mockSharp: jest.Mocked<sharp.Sharp>;

    beforeEach(() => {
        jest.clearAllMocks();
        imageProcessor = new ImageProcessor();

        mockSharp = {
            resize: jest.fn().mockReturnThis(),
            jpeg: jest.fn().mockReturnThis(),
            grayscale: jest.fn().mockReturnThis(),
            raw: jest.fn().mockReturnThis(),
            toBuffer: jest
                .fn()
                // @ts-ignore
                .mockResolvedValue(Buffer.from('processed-image-data')),
        } as any;

        (sharp as unknown as jest.Mock).mockImplementation(() => mockSharp);
        (fs.writeFileSync as unknown as jest.Mock).mockClear();
        (fs.existsSync as unknown as jest.Mock).mockClear();
        (fs.mkdirSync as unknown as jest.Mock).mockClear();
        (fs.unlinkSync as unknown as jest.Mock).mockClear();
        (path.join as unknown as jest.Mock).mockImplementation(
            (...args: any[]) => args.join('/')
        );
    });

    describe('processAndStoreImage', () => {
        it('should process and store image successfully', async () => {
            const base64Image =
                'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
            const email = 'test@example.com';
            const type = 'ENTRY';
            const timestamp = new Date('2023-01-01T10:00:00Z');

            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
            (fs.writeFileSync as jest.Mock).mockImplementation(() => {});

            const result = await imageProcessor.processAndStoreImage(
                base64Image,
                email,
                type as 'ENTRY' | 'EXIT',
                timestamp
            );

            expect(sharp).toHaveBeenCalledWith(
                Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD', 'base64')
            );
            expect(mockSharp.resize).toHaveBeenCalledWith(800, 600, {
                fit: 'inside',
                withoutEnlargement: true,
            });
            expect(mockSharp.jpeg).toHaveBeenCalledWith({ quality: 85 });
            expect(mockSharp.toBuffer).toHaveBeenCalled();
            expect(fs.writeFileSync).toHaveBeenCalled();
            expect(result).toHaveProperty('imagePath');
            expect(result).toHaveProperty('processedImage');
            expect(result.processedImage).toMatch(/^data:image\/jpeg;base64,/);
        });

        it('should throw a generic error if image processing fails', async () => {
            const base64Image = 'invalid-base64-data';
            const email = 'test@example.com';
            const type = 'ENTRY';
            const timestamp = new Date('2023-01-01T10:00:00Z');

            mockSharp.toBuffer.mockRejectedValue(
                new Error('Image processing failed')
            );

            await expect(
                imageProcessor.processAndStoreImage(
                    base64Image,
                    email,
                    type as 'ENTRY' | 'EXIT',
                    timestamp
                )
            ).rejects.toThrow('Failed to process image');
        });

        it('should throw a generic error if file write fails', async () => {
            const base64Image =
                'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD';
            const email = 'test@example.com';
            const type = 'ENTRY';
            const timestamp = new Date('2023-01-01T10:00:00Z');

            (fs.existsSync as jest.Mock).mockReturnValue(false);
            (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
            (fs.writeFileSync as jest.Mock).mockImplementation(() => {
                throw new Error('File write failed');
            });

            await expect(
                imageProcessor.processAndStoreImage(
                    base64Image,
                    email,
                    type as 'ENTRY' | 'EXIT',
                    timestamp
                )
            ).rejects.toThrow('Failed to process image');
        });
    });

    describe('compareImages', () => {
        it('should compare images and return similarity score', async () => {
            const image1 = 'data:image/jpeg;base64,image1-data';
            const image2 = 'data:image/jpeg;base64,image2-data';

            const mockProcessedImage1 = Buffer.from([0, 0, 0, 0]) as any;
            const mockProcessedImage2 = Buffer.from([0, 0, 0, 0]) as any;

            mockSharp.toBuffer
                .mockResolvedValueOnce(mockProcessedImage1)
                .mockResolvedValueOnce(mockProcessedImage2);

            const result = await imageProcessor.compareImages(image1, image2);

            expect(sharp).toHaveBeenCalledTimes(2);
            expect(mockSharp.resize).toHaveBeenCalledWith(100, 100, {
                fit: 'cover',
            });
            expect(mockSharp.grayscale).toHaveBeenCalled();
            expect(mockSharp.raw).toHaveBeenCalled();
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(1);
        });

        it('should return 0 if an error occurs during comparison', async () => {
            const image1 = 'data:image/jpeg;base64,image1-data';
            const image2 = 'data:image/jpeg;base64,image2-data';

            mockSharp.toBuffer.mockRejectedValue(
                new Error('Comparison failed')
            );

            const result = await imageProcessor.compareImages(image1, image2);
            expect(result).toBe(0);
        });
    });

    describe('getImagePath', () => {
        it('should return the correct image path', () => {
            const filename = 'test.jpg';
            const result = imageProcessor.getImagePath(filename);
            expect(result).toContain('uploads');
            expect(result).toContain(filename);
        });
    });

    describe('deleteImage', () => {
        it('should delete the image if it exists', () => {
            const filename = 'test.jpg';
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

            const result = imageProcessor.deleteImage(filename);
            expect(fs.existsSync).toHaveBeenCalled();
            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it('should return false if the image does not exist', () => {
            const filename = 'test.jpg';
            (fs.existsSync as jest.Mock).mockReturnValue(false);

            const result = imageProcessor.deleteImage(filename);
            expect(fs.existsSync).toHaveBeenCalled();
            expect(fs.unlinkSync).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });

        it('should return false if an error occurs', () => {
            const filename = 'test.jpg';
            (fs.existsSync as jest.Mock).mockReturnValue(true);
            (fs.unlinkSync as jest.Mock).mockImplementation(() => {
                throw new Error('Delete failed');
            });

            const result = imageProcessor.deleteImage(filename);
            expect(result).toBe(false);
        });
    });
});
