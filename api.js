const API_URL = "https://script.google.com/macros/s/AKfycby6P0I_eMQxAAnb_6neqzvio_FVsQXy2TkBvZnSqcA3T8u7X05tCwvlYBODjdYrU7l1/exec";

function getField(id) {
  return document.getElementById(id);
}

function resetForm() {
  const barcodeInput = getField("barcode");
  const namaBarangInput = getField("namaBarang");
  const petugasInput = getField("petugas");

  if (barcodeInput) barcodeInput.value = "";
  if (namaBarangInput) namaBarangInput.value = "";
  if (petugasInput) petugasInput.value = "";

  lastResult = "";
  lastScanTime = 0;
}

async function simpanData() {
  const barcode = getField("barcode")?.value.trim() || "";
  const namaBarang = getField("namaBarang")?.value.trim() || "";
  const petugas = getField("petugas")?.value.trim() || "";

  if (!barcode) {
    alert("Silakan scan barcode terlebih dahulu.");
    return;
  }

  if (!namaBarang) {
    alert("Silakan isi nama barang.");
    return;
  }

  if (!petugas) {
    alert("Silakan isi nama petugas.");
    return;
  }

  const statusEl = getField("status");
  if (statusEl) statusEl.innerHTML = "⏳ Menyimpan...";

  const formData = new FormData();
  formData.append("barcode", barcode);
  formData.append("namaBarang", namaBarang);
  formData.append("petugas", petugas);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
      headers: {
        "Accept": "application/json"
      }
    });

    const responseText = await response.text();
    let result = null;

    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Server response bukan JSON:", responseText);
    }

    if (result && result.success) {
      if (statusEl) {
        statusEl.innerHTML = "✅ Data berhasil disimpan";
        statusEl.style.display = "block";
      }

      if (typeof showToast === "function") {
        showToast("✅ Data berhasil disimpan");
      }

      const historyList = getField("historyList");
      if (historyList) {
        historyList.innerHTML = "<div class='history-item'>✔ " + namaBarang + "</div>";
      }

      const barcodeInput = getField("barcode");
      if (barcodeInput) {
        barcodeInput.value = barcode;
      }

      resetForm();

      if (typeof mulaiScanner === "function") {
        setTimeout(() => {
          mulaiScanner();
        }, 300);
      }
    } else {
      const message = result && result.message
        ? result.message
        : "Server Apps Script tidak merespons JSON. Periksa fungsi doPost dan deployment web app.";

      if (statusEl) {
        statusEl.innerHTML = "❌ " + message;
      }
    }
  } catch (err) {
    console.error(err);

    if (statusEl) {
      statusEl.innerHTML = "❌ Gagal menghubungi server";
    }
  }
}