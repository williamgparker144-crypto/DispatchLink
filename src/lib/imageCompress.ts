/**
 * Compress and resize an image data URL so it fits comfortably in localStorage.
 *
 * Target: ≤ 80 KB output.  We resize to maxDim×maxDim then encode as JPEG
 * with progressive quality reduction until the result is under the budget.
 */

const MAX_BYTES = 80_000;   // 80 KB target
const MAX_DIM   = 400;      // max width/height in pixels

export function compressImage(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Scale down if larger than MAX_DIM
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width  = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality until under budget
      for (let quality = 0.8; quality >= 0.3; quality -= 0.1) {
        const result = canvas.toDataURL('image/jpeg', quality);
        if (result.length <= MAX_BYTES * 1.37) { // base64 overhead ≈ 37%
          resolve(result);
          return;
        }
      }
      // Last resort: lowest quality
      resolve(canvas.toDataURL('image/jpeg', 0.25));
    };
    img.onerror = () => {
      // If we can't process it, return original (best effort)
      resolve(dataUrl);
    };
    img.src = dataUrl;
  });
}
