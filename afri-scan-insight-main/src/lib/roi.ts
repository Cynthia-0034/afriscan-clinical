export interface RoiBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function detectHeuristicROI(
  file: File,
): Promise<RoiBox | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 256;

      let w = img.width;
      let h = img.height;

      if (w > h) {
        h = Math.round((h / w) * maxSize);
        w = maxSize;
      } else {
        w = Math.round((w / h) * maxSize);
        h = maxSize;
      }

      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(undefined);
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);

      const { data } = ctx.getImageData(0, 0, w, h);

      const gray: number[] = [];
      for (let i = 0; i < data.length; i += 4) {
        gray.push((data[i] + data[i + 1] + data[i + 2]) / 3);
      }

      const patchW = Math.max(24, Math.floor(w * 0.16));
      const patchH = Math.max(24, Math.floor(h * 0.16));

      let bestScore = -Infinity;
      let bestX = Math.floor(w * 0.25);
      let bestY = Math.floor(h * 0.25);

      // Avoid borders and the central spine area
      const startX = Math.floor(w * 0.08);
      const endX = Math.floor(w * 0.92 - patchW);
      const startY = Math.floor(h * 0.12);
      const endY = Math.floor(h * 0.82 - patchH);

      for (let y = startY; y < endY; y += 4) {
        for (let x = startX; x < endX; x += 4) {
          const centerX = x + patchW / 2;
          const centerY = y + patchH / 2;

          // Skip central spine / heart strip to avoid same middle box
          if (centerX > w * 0.42 && centerX < w * 0.58) continue;

          // Prefer lung zones, not extreme corners
          if (centerY < h * 0.12 || centerY > h * 0.82) continue;

          let sum = 0;
          let texture = 0;
          let count = 0;

          for (let py = 0; py < patchH; py++) {
            for (let px = 0; px < patchW; px++) {
              const idx = (y + py) * w + (x + px);
              const v = gray[idx];
              sum += v;
              count++;
            }
          }

          const mean = sum / count;

          for (let py = 1; py < patchH - 1; py++) {
            for (let px = 1; px < patchW - 1; px++) {
              const idx = (y + py) * w + (x + px);
              const gx = gray[idx + 1] - gray[idx - 1];
              const gy = gray[idx + w] - gray[idx - w];
              texture += Math.abs(gx) + Math.abs(gy);
            }
          }

          texture = texture / count;
          const darkness = 255 - mean;

          // Weighted score
          let score = darkness * 0.55 + texture * 0.45;

          // Slight preference to upper/mid lung zones for TB-like patterns
          if (centerY < h * 0.45) score *= 1.08;

          // Slight preference to lateral lung fields, not center
          if (centerX < w * 0.4 || centerX > w * 0.6) score *= 1.05;

          if (score > bestScore) {
            bestScore = score;
            bestX = x;
            bestY = y;
          }
        }
      }

      URL.revokeObjectURL(url);

      resolve({
        x: Math.round((bestX / w) * 100),
        y: Math.round((bestY / h) * 100),
        width: Math.round((patchW / w) * 100),
        height: Math.round((patchH / h) * 100),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };

    img.src = url;
  });
}
