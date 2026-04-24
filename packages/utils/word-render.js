import mammoth from "mammoth/mammoth.browser";

async function readWordInput(input) {
  if (input instanceof ArrayBuffer) return input;
  if (ArrayBuffer.isView(input)) {
    return input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  }
  if (input instanceof Blob) {
    return input.arrayBuffer();
  }
  if (typeof input === "string") {
    const res = await fetch(input);
    if (!res.ok) {
      throw new Error(`Word 下载失败: ${res.status}`);
    }
    return res.arrayBuffer();
  }
  throw new Error("不支持的 Word 输入类型");
}

export async function renderWordToHtml(input, type = "") {
  const mime = String(type || "").toLowerCase();
  if (mime === "application/msword") {
    throw new Error("暂不支持 .doc，请使用 .docx");
  }
  const data = await readWordInput(input);
  const result = await mammoth.convertToHtml({ arrayBuffer: data });
  return result.value || "";
}
