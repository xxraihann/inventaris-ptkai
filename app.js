// ======================================
// INVENTARIS PT KAI
// SCANNER ENGINE V3.2
// GITHUB PAGES MOBILE FIX
// ======================================

let codeReader;
let scannerControls;
let activeStream;
let lastResult = "";
let lastScanTime = 0;
let currentZoom = 1;
let flashOn = false;

const SCAN_DELAY = 2000;

const beep = new Audio(
  "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
);

// ======================================
// ZXING HINT
// ======================================

function buatHints() {
  const hints = new Map();

  hints.set(
    ZXing.DecodeHintType.POSSIBLE_FORMATS,
    [
      ZXing.BarcodeFormat.QR_CODE,
      ZXing.BarcodeFormat.DATA_MATRIX,
      ZXing.BarcodeFormat.CODE_128,
      ZXing.BarcodeFormat.CODE_39,
      ZXing.BarcodeFormat.CODE_93,
      ZXing.BarcodeFormat.CODABAR,
      ZXing.BarcodeFormat.EAN_13,
      ZXing.BarcodeFormat.EAN_8,
      ZXing.BarcodeFormat.UPC_A,
      ZXing.BarcodeFormat.UPC_E,
      ZXing.BarcodeFormat.ITF,
      ZXing.BarcodeFormat.PDF_417,
      ZXing.BarcodeFormat.AZTEC
    ]
  );

  hints.set(
    ZXing.DecodeHintType.TRY_HARDER,
    true
  );

  hints.set(
    ZXing.DecodeHintType.ALSO_INVERTED,
    true
  );

  hints.set(
    ZXing.DecodeHintType.CHARACTER_SET,
    "UTF-8"
  );

  return hints;
}

// ======================================
// CAMERA CLEANUP
// ======================================

async function stopScanner() {
  if (scannerControls && typeof scannerControls.stop === "function") {
    try {
      await scannerControls.stop();
    } catch (e) {
      console.log("Stop scanner sebelumnya gagal");
    }
  }

  if (activeStream) {
    activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;
  }
}

// ======================================
// START SCANNER
// ======================================

async function mulaiScanner() {
  try {
    status("📷 Membuka kamera...");

    const video = document.getElementById("cameraVideo");

    if (!video) {
      status("❌ Video tidak ditemukan");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      status("❌ Browser ini tidak mendukung kamera");
      return;
    }

    await stopScanner();

    codeReader = new ZXingBrowser.BrowserMultiFormatReader(buatHints());

    const constraints = {
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    activeStream = stream;

    await video.play().catch(() => {});

    const onScan = (result) => {
      if (!result) return;

      const barcode = result.text.trim();
      const now = Date.now();

      if (barcode === lastResult && (now - lastScanTime) < SCAN_DELAY) {
        return;
      }

      lastResult = barcode;
      lastScanTime = now;

      const barcodeInput = document.getElementById("barcode");
      if (barcodeInput) {
        barcodeInput.value = barcode;
      }

      suksesScan();
    };

    scannerControls = await codeReader.decodeFromVideoElement(video, onScan)
      .catch(async () => {
        return await codeReader.decodeFromConstraints(constraints, video, onScan);
      });

    await terapkanFocus();
    status("✅ Scanner siap");
  } catch (error) {
    console.error(error);
    status("❌ Kamera gagal : " + (error.name || "UnknownError"));
  }
}

// ======================================
// AUTO FOCUS
// ======================================

async function terapkanFocus() {
  if (!activeStream) return;

  const track = activeStream.getVideoTracks()[0];
  if (!track) return;

  try {
    const capabilities = track.getCapabilities();

    if (capabilities.focusMode && capabilities.focusMode.includes("continuous")) {
      await track.applyConstraints({
        advanced: [{ focusMode: "continuous" }]
      });
    }
  } catch (e) {
    console.log("Focus tidak didukung");
  }
}

// ======================================
// FLASH
// ======================================

async function toggleFlash() {
  if (!activeStream) return;

  const track = activeStream.getVideoTracks()[0];
  if (!track) return;

  const capabilities = track.getCapabilities();

  if (!capabilities.torch) {
    status("⚠️ Flash tidak tersedia");
    return;
  }

  flashOn = !flashOn;

  await track.applyConstraints({
    advanced: [{ torch: flashOn }]
  });
}

// ======================================
// ZOOM
// ======================================

async function ubahZoom(arah) {
  if (!activeStream) return;

  const track = activeStream.getVideoTracks()[0];
  if (!track) return;

  const capabilities = track.getCapabilities();

  if (!capabilities.zoom) {
    status("⚠️ Zoom tidak tersedia");
    return;
  }

  if (arah === "in") {
    currentZoom = Math.min(capabilities.zoom.max, currentZoom + 0.5);
  } else {
    currentZoom = Math.max(capabilities.zoom.min, currentZoom - 0.5);
  }

  await track.applyConstraints({
    advanced: [{ zoom: currentZoom }]
  });

  const zoomValue = document.getElementById("zoomValue");
  if (zoomValue) {
    zoomValue.innerText = currentZoom.toFixed(1) + "x";
  }
}

// ======================================
// SUKSES
// ======================================

function suksesScan() {
  if (navigator.vibrate) {
    navigator.vibrate(150);
  }

  beep.currentTime = 0;
  beep.play().catch(() => {});

  stopScanner();
  status("✅ Barcode berhasil dipindai");
}

function showToast(message) {
  let toast = document.getElementById("toastNotification");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toastNotification";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerText = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

// ======================================
// STATUS
// ======================================

function status(text) {
  const el = document.getElementById("status");

  if (el) {
    el.innerHTML = text;
    el.style.display = "block";
  }
}

// ======================================
// EVENT
// ======================================

window.addEventListener("load", () => {
  const start = document.getElementById("startCamera");

  if (start) {
    start.onclick = function () {
      mulaiScanner();
    };
  }

  const flashBtn = document.getElementById("flashBtn");
  const zoomIn = document.getElementById("zoomIn");
  const zoomOut = document.getElementById("zoomOut");

  if (flashBtn) flashBtn.onclick = toggleFlash;
  if (zoomIn) zoomIn.onclick = () => ubahZoom("in");
  if (zoomOut) zoomOut.onclick = () => ubahZoom("out");
});

window.addEventListener("beforeunload", () => {
  stopScanner();
});