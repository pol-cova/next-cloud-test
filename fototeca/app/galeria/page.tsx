import { FileUploadDemo } from "@/components/file-form";
import { Gallery } from "@/components/gallery";

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Galeria</h1>
      </div>
      <Gallery />
    </div>
  );
}
