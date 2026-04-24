import * as XLSX from "xlsx";

async function readExcelInput(input) {
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
      throw new Error(`Excel 下载失败: ${res.status}`);
    }
    return res.arrayBuffer();
  }
  throw new Error("不支持的 Excel 输入类型");
}

export async function parseExcelSheets(input) {
  const data = await readExcelInput(input);
  const workbook = XLSX.read(data, { type: "array" });
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      blankrows: false,
      raw: false,
    });
    return {
      name,
      rows,
    };
  });
}
