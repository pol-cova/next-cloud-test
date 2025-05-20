"use client";

import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

export function FileUploadDemo() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<{ name: string; path: string }[]>([]);

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast.error(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  }, []);

  const handleUpload = React.useCallback(async (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    }
  ) => {
    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Handle results
      const successfulUploads: { name: string; path: string }[] = [];
      data.results.forEach((result: any) => {
        if (result.error) {
          options.onError(
            files.find(f => f.name === result.name) || files[0],
            new Error(result.error)
          );
        } else {
          // Attach uploaded path to the File object for preview
          const fileObj = files.find(f => f.name === result.name);
          if (fileObj) {
            (fileObj as any)._uploadedPath = result.path;
          }
          options.onSuccess(files.find(f => f.name === result.name) || files[0]);
          successfulUploads.push({
            name: result.name,
            path: result.path
          });
        }
      });

      if (successfulUploads.length > 0) {
        setUploadedFiles(prev => [...prev, ...successfulUploads]);
        toast.success('Files uploaded successfully', {
          description: (
            <div className="mt-2">
              <p>Successfully uploaded:</p>
              <ul className="list-disc list-inside">
                {successfulUploads.map(file => (
                  <li key={file.path} className="text-sm">
                    {file.name.length > 25 ? `${file.name.slice(0, 25)}...` : file.name}
                  </li>
                ))}
              </ul>
            </div>
          ),
        });
      }

      if (data.success) {
        setFiles([]);
      } else {
        toast.error('Some files failed to upload');
      }
    } catch (error) {
      files.forEach(file => {
        options.onError(file, error instanceof Error ? error : new Error('Upload failed'));
      });
      toast.error('Upload failed', {
        description: error instanceof Error ? error.message : 'An error occurred while uploading files',
      });
    } finally {
      setUploading(false);
    }
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <FileUpload
        maxFiles={5}
        maxSize={100 * 1024 * 1024} // 100MB
        value={files}
        onValueChange={setFiles}
        onFileReject={onFileReject}
        onUpload={handleUpload}
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
        disabled={uploading}
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">Drag & drop files here</p>
            <p className="text-muted-foreground text-xs">
              Or click to browse (max 5 files, up to 100MB each)
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-fit"
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Browse files'}
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file}>
              <div className="flex w-full items-center gap-2">
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="size-7"
                    disabled={uploading}
                  >
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </div>
              <FileUploadItemProgress />
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>

      {uploadedFiles.length > 0 && (
        <div className="flex flex-col gap-4">
          <p className="font-medium text-sm">Recently uploaded files</p>
          <div className="flex items-center gap-2 overflow-x-auto">
            {uploadedFiles.map((file) => (
              <div 
                key={file.path} 
                className="relative size-20 rounded-md border bg-muted/50 p-2"
              >
                <p className="text-xs truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {file.path}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}