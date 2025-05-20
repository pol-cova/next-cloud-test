import { NextRequest, NextResponse } from 'next/server';
import { createClient } from 'webdav';

const NEXTCLOUD_URL = 'http://localhost:8080/remote.php/dav/files/root';
const NEXTCLOUD_USERNAME = 'root';
const NEXTCLOUD_PASSWORD = 'aRZTC-37KsF-Q26y7-4Pbi3-smL2C';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const webdavClient = createClient(NEXTCLOUD_URL, {
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_PASSWORD
});

type MediaType = 'image' | 'video';

function getMediaType(mimeType: string): MediaType | null {
    if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
    if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
    return null;
}

function getUploadPath(fileName: string, mediaType: MediaType): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `/${mediaType}s/${timestamp}-${sanitizedFileName}`;
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files');

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        const results = await Promise.all(
            files.map(async (file) => {
                if (!(file instanceof File)) {
                    return {
                        error: 'Invalid file upload',
                        name: 'unknown'
                    };
                }

                if (file.size > MAX_FILE_SIZE) {
                    return {
                        error: 'File size exceeds maximum limit of 100MB',
                        name: file.name
                    };
                }

                const mediaType = getMediaType(file.type);
                if (!mediaType) {
                    return {
                        error: 'Unsupported file type',
                        name: file.name
                    };
                }

                try {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    const uploadPath = getUploadPath(file.name, mediaType);

                    await webdavClient.putFileContents(uploadPath, buffer, {
                        overwrite: true
                    });

                    return {
                        success: true,
                        path: uploadPath,
                        type: mediaType,
                        size: file.size,
                        name: file.name
                    };
                } catch (error) {
                    console.error(`Upload error for ${file.name}:`, error);
                    return {
                        error: 'File upload failed',
                        name: file.name
                    };
                }
            })
        );

        const hasErrors = results.some(result => 'error' in result);
        return NextResponse.json({
            success: !hasErrors,
            results
        }, { status: hasErrors ? 207 : 200 });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'File upload failed' },
            { status: 500 }
        );
    }
} 