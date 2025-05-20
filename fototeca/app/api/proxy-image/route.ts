import { NextRequest, NextResponse } from 'next/server';
import { createClient, FileStat } from 'webdav';

const NEXTCLOUD_URL = 'http://localhost:8080/remote.php/dav/files/root';
const NEXTCLOUD_USERNAME = 'root';
const NEXTCLOUD_PASSWORD = 'aRZTC-37KsF-Q26y7-4Pbi3-smL2C';

const webdavClient = createClient(NEXTCLOUD_URL, {
  username: NEXTCLOUD_USERNAME,
  password: NEXTCLOUD_PASSWORD,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
  }
  try {
    const buffer = await webdavClient.getFileContents(path, { format: 'binary' });
    const stat = await webdavClient.stat(path) as FileStat;
    const contentType = (stat && 'mime' in stat && stat.mime) ? stat.mime : 'application/octet-stream';
    const contentLength = (stat && 'size' in stat && typeof stat.size === 'number') ? stat.size.toString() : undefined;
    const body = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer as ArrayBuffer);
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    };
    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }
    return new NextResponse(body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    if (err?.status === 404) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
} 