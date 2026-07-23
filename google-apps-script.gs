const SPREADSHEET_ID = "1-X5eAFWgsaGWYvDzfQZ0pK1UEzB1VFRtRBnpLt4BhqI";
const SHEET_NAME = "Data Scan";

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile("index")
    .setTitle("Inventaris Aset IT PT KAI")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const payload = e && e.parameter ? e.parameter : {};

    const barcode = String(payload.barcode || "").trim();
    const namaBarang = String(payload.namaBarang || "").trim();
    const petugas = String(payload.petugas || "").trim();

    if (!barcode || !namaBarang || !petugas) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          message: "Data tidak lengkap. barcode, namaBarang, dan petugas wajib diisi."
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Sheet 'Data Scan' tidak ditemukan.");
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    if (!headers || headers.length === 0 || headers[0] !== "Tanggal") {
      sheet.getRange(1, 1, 1, 4).setValues([["Tanggal", "Barcode", "Nama Barang", "Petugas"]]);
    }

    sheet.appendRow([new Date(), barcode, namaBarang, petugas]);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: "Data berhasil disimpan"
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function simpanData(data) {
  try {
    const sheet = SpreadsheetApp
      .openById(SPREADSHEET_ID)
      .getSheetByName(SHEET_NAME);

    if (!sheet) {
      throw new Error("Sheet 'Data Scan' tidak ditemukan.");
    }

    sheet.appendRow([
      new Date(),
      data.barcode,
      data.namaBarang,
      data.petugas
    ]);

    return {
      success: true,
      message: "Data berhasil disimpan"
    };
  } catch (error) {
    return {
      success: false,
      message: error.toString()
    };
  }
}
