// ============================================================
// Client-Side Image Compression Pipeline (WebP, Max 1920px, Quality 0.78)
// Specifications: Section 39, 40, 41, 42
// ============================================================

export interface CompressionResult {
  file: File;
  blob: Blob;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  mimeType: string;
  savedPercent: number;
}

export interface CompressionOptions {
  maxLongEdge?: number; // default 1920 px
  quality?: number;     // default 0.78
  maxSourceSizeMB?: number; // default 15 MB
}

export async function compressImageClientSide(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const maxLongEdge = options.maxLongEdge || 1920;
  const quality = options.quality ?? 0.78;
  const maxSourceSizeMB = options.maxSourceSizeMB || 15;

  // 1. Validate File Size
  const maxBytes = maxSourceSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('Gambar terlalu besar untuk diproses (Maksimum 15 MB).');
  }

  // 2. Validate MIME type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error('Format gambar tidak disokong. Sila gunakan JPG, PNG, atau WebP.');
  }

  // 3. Load image into HTML Image object safely
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Gagal menyahkod gambar.'));
      image.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca fail gambar.'));
    reader.readAsDataURL(file);
  });

  // 4. Calculate target dimensions (do not upscale small photos)
  let { width, height } = img;
  const longEdge = Math.max(width, height);

  if (longEdge > maxLongEdge) {
    const ratio = maxLongEdge / longEdge;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // 5. Draw onto OffscreenCanvas or Canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Gagal memproses kanvas grafik browser.');
  }

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // 6. Export to WebP blob
  const mimeType = 'image/webp';
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Gagal memampatkan gambar ke format WebP.'));
      },
      mimeType,
      quality
    );
  });

  const previewUrl = URL.createObjectURL(blob);
  const originalSize = file.size;
  const compressedSize = blob.size;
  const savedPercent = originalSize > 0 
    ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
    : 0;

  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', {
    type: mimeType,
    lastModified: Date.now()
  });

  return {
    file: compressedFile,
    blob,
    previewUrl,
    originalSize,
    compressedSize,
    width,
    height,
    mimeType,
    savedPercent
  };
}
