let pdfjsLibPromise = null;

function ensurePromiseWithResolvers() {
  if (typeof Promise.withResolvers === "function") return;
  Promise.withResolvers = function withResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

function resolveCanvasScale(page) {
  const viewport = page.getViewport({ scale: 1 });
  if (!viewport.width || !viewport.height) return 1;
  const maxSide = 1500;
  const longSide = Math.max(viewport.width, viewport.height);
  return Math.max(1, Math.min(maxSide / longSide, 2));
}

async function loadPdfJsLib() {
  if (typeof window === "undefined") {
    throw new Error("PDF 预览仅支持浏览器环境");
  }
  if (window.__FILE_PREVIEW_PDFJS__) return window.__FILE_PREVIEW_PDFJS__;
  if (pdfjsLibPromise) return pdfjsLibPromise;
  ensurePromiseWithResolvers();
  pdfjsLibPromise = import("pdfjs-dist/legacy/build/pdf.mjs").then((mod) => {
    const lib = mod && mod.default ? mod.default : mod;
    if (!lib || typeof lib.getDocument !== "function") {
      throw new Error("PDF.js 加载失败");
    }
    if (lib.GlobalWorkerOptions && !lib.GlobalWorkerOptions.workerSrc) {
      const version = lib.version || "5.6.205";
      // pdfjs-dist v5 需要显式指定 workerSrc；这里使用稳定 CDN 兜底。
      lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/legacy/build/pdf.worker.min.mjs`;
    }
    window.__FILE_PREVIEW_PDFJS__ = lib;
    return lib;
  });
  return pdfjsLibPromise;
}

async function readPdfInput(input) {
  if (input instanceof ArrayBuffer) return input;
  if (ArrayBuffer.isView(input)) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  }
  if (input instanceof Blob) {
    return input.arrayBuffer();
  }
  if (typeof input === "string") {
    return input;
  }
  throw new Error("不支持的 PDF 输入类型");
}

export async function renderPdfPagesToImages(input) {
  const pdfjsLib = await loadPdfJsLib();
  const source = await readPdfInput(input);
  const loadingTask =
    typeof source === "string"
      ? pdfjsLib.getDocument({
          url: source,
          disableWorker: true,
        })
      : pdfjsLib.getDocument({
          data: source,
          disableWorker: true,
        });
  const pdfDoc = await loadingTask.promise;
  const images = [];
  for (let i = 1; i <= pdfDoc.numPages; i += 1) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: resolveCanvasScale(page) });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    await page.render({ canvasContext: ctx, viewport }).promise;
    images.push({
      pageNumber: i,
      src: canvas.toDataURL("image/png"),
      width: canvas.width,
      height: canvas.height,
    });
  }
  if (typeof loadingTask.destroy === "function") {
    loadingTask.destroy();
  }
  return images;
}
