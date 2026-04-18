/** 常见图片扩展名 → MIME（用于从 URL 推断） */
const IMAGE_EXT_TO_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  avif: "image/avif",
};

const VIDEO_EXT_TO_MIME = {
  mp4: "video/mp4",
  webm: "video/webm",
  ogv: "video/ogg",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
};

const AUDIO_EXT_TO_MIME = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  oga: "audio/ogg",
  ogg: "audio/ogg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  flac: "audio/flac",
  opus: "audio/opus",
};

/** 当前组件不预览的已知类型（需业务侧自行处理） */
const KNOWN_OTHER_EXT = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/**
 * 从 URL 推断 MIME 或简短类型；无法识别返回 "unknown"
 * @param {string} url
 * @returns {string}
 */
export function inferTypeFromUrl(url) {
  if (url == null || typeof url !== "string") return "unknown";
  const s = url.trim();
  if (!s) return "unknown";

  const lower = s.toLowerCase();
  if (lower.startsWith("data:")) {
    const semi = lower.indexOf(";");
    const mime = semi > 5 ? lower.slice(5, semi) : "";
    return mime || "unknown";
  }

  let pathname = "";
  try {
    pathname = new URL(s).pathname;
  } catch {
    pathname = s.split("?")[0].split("#")[0];
  }

  const base = pathname.split("/").pop() || "";
  const dot = base.lastIndexOf(".");
  if (dot === -1 || dot === base.length - 1) return "unknown";
  const ext = base.slice(dot + 1).toLowerCase();
  if (!ext) return "unknown";

  if (IMAGE_EXT_TO_MIME[ext]) return IMAGE_EXT_TO_MIME[ext];
  if (VIDEO_EXT_TO_MIME[ext]) return VIDEO_EXT_TO_MIME[ext];
  if (AUDIO_EXT_TO_MIME[ext]) return AUDIO_EXT_TO_MIME[ext];
  if (KNOWN_OTHER_EXT[ext]) return KNOWN_OTHER_EXT[ext];
  return "unknown";
}

/**
 * @param {string} type
 * @returns {'image' | 'video' | 'audio' | null}
 */
export function mediaKindFromType(type) {
  if (type == null || type === "" || type === "unknown") return null;
  const t = String(type).trim().toLowerCase();

  if (t === "image" || t.startsWith("image/")) return "image";
  if (t === "video" || t.startsWith("video/")) return "video";
  if (t === "audio" || t.startsWith("audio/")) return "audio";

  if (Object.prototype.hasOwnProperty.call(IMAGE_EXT_TO_MIME, t))
    return "image";
  if (Object.prototype.hasOwnProperty.call(VIDEO_EXT_TO_MIME, t))
    return "video";
  if (Object.prototype.hasOwnProperty.call(AUDIO_EXT_TO_MIME, t))
    return "audio";

  return null;
}

/**
 * @param {Array<{ url: string, type?: string, poster?: string, resetOnClose?: boolean }>} items
 * @returns {Array<{ url: string, type: string, mediaKind: 'image'|'video'|'audio'|null, poster: string, resetOnClose: boolean, supported: boolean, typeSource: 'explicit' | 'inferred' }>}
 */
export function normalizePreviewItems(items) {
  if (!Array.isArray(items)) return [];

  return items.map((raw, index) => {
    const url = raw && typeof raw.url === "string" ? raw.url : "";
    const poster =
      raw && raw.poster != null && typeof raw.poster === "string"
        ? raw.poster
        : "";
    const resetOnClose = !(raw && raw.resetOnClose === false);
    let type = raw && raw.type != null ? String(raw.type).trim() : "";
    let typeSource = "explicit";

    if (!type) {
      type = inferTypeFromUrl(url);
      typeSource = "inferred";
    }

    const mediaKind = mediaKindFromType(type);
    const supported = mediaKind !== null;

    if (!supported && process.env.NODE_ENV !== "production") {
      console.warn(
        "[FilePreview] 类型无法识别或当前不支持预览，请为该条传入明确的 type（如 image/png、video/mp4、audio/mpeg）。",
        { index, url, type, typeSource }
      );
    }

    return {
      url,
      type,
      mediaKind: supported ? mediaKind : null,
      poster,
      resetOnClose,
      supported,
      typeSource,
    };
  });
}
