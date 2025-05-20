import { NextResponse } from 'next/server';
import { createClient, FileStat } from 'webdav';

const NEXTCLOUD_URL = 'http://localhost:8080/remote.php/dav/files/root';
const NEXTCLOUD_USERNAME = 'root';
const NEXTCLOUD_PASSWORD = 'aRZTC-37KsF-Q26y7-4Pbi3-smL2C';

const webdavClient = createClient(NEXTCLOUD_URL, {
    username: NEXTCLOUD_USERNAME,
    password: NEXTCLOUD_PASSWORD
});

export async function GET() {
    try {
        // Fetch img and video directories
        const [imagesDir, videosDir] = await Promise.all([
            webdavClient.getDirectoryContents('/images') as Promise<FileStat[]>,
            webdavClient.getDirectoryContents('/videos') as Promise<FileStat[]>
        ]);

        const items = [
            ...imagesDir.map((item) => ({
                path: item.filename,
                type: 'image' as const,
                name: item.basename,
                size: item.size
            })),
            ...videosDir.map((item) => ({
                path: item.filename,
                type: 'video' as const,
                name: item.basename,
                size: item.size
            }))
        ];

        return NextResponse.json({ items });
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json(
            { error: 'Failed to fetch media items' },
            { status: 500 }
        );
    }
} 