"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface MediaItem {
  path: string;
  type: 'image' | 'video';
  name: string;
  size: number;
}

const NEXTCLOUD_URL = 'http://localhost:8080/remote.php/dav/files/root';

export function Gallery() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/media');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch media');
        }

        setMediaItems(data.items);
      } catch (err) {
        setError('Failed to load media items');
        console.error('Error fetching media:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No media items found. Upload some files to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {mediaItems.map((item) => (
        <div
          key={item.path}
          className="relative group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
        >
          {item.type === 'image' ? (
            <div className="aspect-square relative">
              <Image
                src={`/api/proxy-image?path=${encodeURIComponent(item.path)}`}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ) : (
            <div className="aspect-square relative bg-gray-100">
              <video
                src={`${NEXTCLOUD_URL}${item.path}`}
                className="w-full h-full object-cover"
                controls
              />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-sm truncate">{item.name}</p>
            <p className="text-xs text-gray-300">{formatFileSize(item.size)}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 