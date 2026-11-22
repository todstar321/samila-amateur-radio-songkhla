import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';

/**
 * Helper to ensure all <img> tags inside an element are fully loaded and decoded
 * Prevents race conditions where capture runs before images or background templates are painted
 */
async function waitForImagesToLoad(element) {
  if (!element) return;
  const images = Array.from(element.querySelectorAll('img'));
  if (images.length === 0) return;

  await Promise.all(
    images.map((img) => {
      // If already complete with valid dimensions, ensure decode is finished
      if (img.complete && img.naturalWidth > 0) {
        return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
      }
      return new Promise((resolve) => {
        let isDone = false;
        const done = () => {
          if (isDone) return;
          isDone = true;
          if (img.decode) {
            img.decode().catch(() => {}).then(resolve);
          } else {
            resolve();
          }
        };
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
        // Failsafe timeout in case image never fires
        setTimeout(done, 1500);
      });
    })
  );
}

/**
 * Captures a DOM container into a high-resolution PNG data URL
 * Primary Engine: toPng (html-to-image with skipFonts: true - lightning-fast SVG rasterization, 100% preserves embedded Base64 templates & avatars)
 * Secondary Engine: html2canvas (with allowTaint: true and useCORS: false so data URLs are never dropped)
 *
 * @param {HTMLElement} element - The DOM element to capture
 * @param {Object} options - Custom options (scale, backgroundColor, etc.)
 * @returns {Promise<string>} PNG Data URL
 */
export async function captureElementToDataUrl(element, options = {}) {
  if (!element) {
    throw new Error('Element to capture is null or undefined');
  }

  // 1. Wait for all <img> tags to be loaded and decoded into memory
  await waitForImagesToLoad(element);

  // 2. Extra settle delay for browser layout flush and font rendering
  await new Promise((resolve) => setTimeout(resolve, 150));

  // Save original scroll positions
  const origScrollTop = element.scrollTop;
  const origScrollLeft = element.scrollLeft;

  // Filter function for excluding UI controls from export
  const filterFn = (node) => {
    if (node.classList && (
      node.classList.contains('no-export') || 
      node.classList.contains('export-exclude') ||
      node.classList.contains('field-delete-btn')
    )) {
      return false;
    }
    return true;
  };

  // Strategy 1: toPng (html-to-image with skipFonts: true and cacheBust: false)
  // Lightning-fast SVG rasterizer that embeds Base64 background images without CORS stripping
  try {
    const dataUrl = await toPng(element, {
      pixelRatio: options.scale || 2,
      backgroundColor: options.backgroundColor || '#ffffff',
      cacheBust: false,
      skipFonts: true,
      filter: filterFn,
      ...options
    });

    element.scrollTop = origScrollTop;
    element.scrollLeft = origScrollLeft;

    // Validate that toPng output is a valid PNG data URL
    if (dataUrl && dataUrl.startsWith('data:image/png') && dataUrl.length > 10000) {
      return dataUrl;
    }
    console.warn('toPng output smaller than expected (<10KB), falling back to html2canvas...');
  } catch (err) {
    console.warn('toPng primary capture failed, falling back to html2canvas:', err);
  }

  // Strategy 2: html2canvas (Direct 2D Canvas rendering with allowTaint: true and useCORS: false)
  // allowTaint: true ensures Base64 and local image pixels are never silently omitted
  try {
    const canvas = await html2canvas(element, {
      scale: options.scale || 2, // 2x sharpness
      useCORS: false,
      allowTaint: true,
      backgroundColor: options.backgroundColor || '#ffffff',
      logging: false,
      ignoreElements: (node) => !filterFn(node)
    });

    element.scrollTop = origScrollTop;
    element.scrollLeft = origScrollLeft;

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    if (dataUrl && dataUrl.length > 50000) {
      return dataUrl;
    }
    console.warn('html2canvas output was smaller than expected, retrying toPng with settle...');
  } catch (h2cErr) {
    console.warn('html2canvas fallback failed:', h2cErr);
  }

  // Strategy 3: Retry toPng with small delay
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const dataUrl = await toPng(element, {
      pixelRatio: options.scale || 2,
      backgroundColor: options.backgroundColor || '#ffffff',
      cacheBust: false,
      skipFonts: true,
      filter: filterFn
    });

    element.scrollTop = origScrollTop;
    element.scrollLeft = origScrollLeft;
    return dataUrl;
  } catch (finalErr) {
    console.error('All image export strategies failed:', finalErr);
    element.scrollTop = origScrollTop;
    element.scrollLeft = origScrollLeft;
    throw finalErr;
  }
}
