// ======================================
// INVENTARIS PT KAI
// SCANNER ENGINE V3.0 - ZXing (dioptimasi)
// ======================================

let codeReader;
let scannerControls;   // controls dari decodeFromConstraints, buat stop/torch
let activeStream;       // referensi stream buat flash & zoom
let lastResult = "";
let lastScanTime = 0;
let currentZoom = 1;

const SCAN_DELAY = 2000;

const beep = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
);

// ======================================
// HINTS ZXING
// Barcode di aset PT KAI adalah barcode 1D (Code128/Code39/EAN),
// BUKAN QR. Membatasi format bikin decoder jauh lebih cepat &
// akurat karena tidak perlu coba ~13 format tiap frame.
// Kalau ternyata ada juga kode berbentuk QR, tambahkan
// ZXing.BarcodeFormat.QR_CODE ke array di bawah.
// ======================================

function buatHints() {

    const hints = new Map();

    hints.set(
        ZXing.DecodeHintType.POSSIBLE_FORMATS,
        [
            ZXing.BarcodeFormat.CODE_128,
            ZXing.BarcodeFormat.CODE_39,
            ZXing.BarcodeFormat.EAN_13,
            ZXing.BarcodeFormat.EAN_8,
            ZXing.BarcodeFormat.UPC_A
        ]
    );

    // TRY_HARDER dimatikan by default (lebih cepat). Kalau barcode
    // banyak yang buram/rusak dan susah kebaca, ubah jadi true --
    // konsekuensinya scan sedikit lebih lambat per frame.
    hints.set(ZXing.DecodeHintType.TRY_HARDER, false);

    return hints;

}

async function mulaiScanner() {

    try {

        status("📷 Mencari kamera...");

        const videoInputDevices =
            await ZXingBrowser.BrowserCodeReader.listVideoInputDevices();

        if (!videoInputDevices.length) {

            status("❌ Kamera tidak ditemukan");

            return;
        }

        // Cari kamera belakang
        let selectedDevice =
            videoInputDevices.find(device =>
                device.label.toLowerCase().includes("back") ||
                device.label.toLowerCase().includes("rear") ||
                device.label.toLowerCase().includes("environment")
            );

        if (!selectedDevice) {
            selectedDevice = videoInputDevices[videoInputDevices.length - 1];
        }

        codeReader = new ZXingBrowser.BrowserMultiFormatReader(buatHints());

        status("📷 Membuka kamera...");

        // Resolusi & autofocus di-set SEKALIGUS saat kamera pertama kali
        // dibuka (bukan diubah belakangan) supaya video track tidak
        // "restart" di tengah proses decode -- ini penyebab utama
        // scan lama/gagal sebelumnya.
        const constraints = {
            video: {
                deviceId: { exact: selectedDevice.deviceId },
                facingMode: "environment",
                focusMode: "continuous",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        };

        scannerControls = await codeReader.decodeFromConstraints(
            constraints,
            "reader",
            (result, err) => {

                if (result) {

                    const barcode =
                        result.text.trim();

                    const now = Date.now();

                    if (
                        barcode === lastResult &&
                        (now - lastScanTime) < SCAN_DELAY
                    ) {
                        return;
                    }

                    lastResult = barcode;
                    lastScanTime = now;

                    document.getElementById("barcode").value =
                        barcode;

                    suksesScan();
                }
            }
        );

        const video = document.querySelector("#reader video");

        if (video && video.srcObject) {
            activeStream = video.srcObject;
        }

        status("✅ Scanner siap");

    }

    catch (error) {

        console.error(error);

        status("❌ Gagal membuka kamera");

    }

}

// ======================================
// FLASH (TORCH)
// ======================================

let flashOn = false;

async function toggleFlash() {

    if (!activeStream) return;

    const track = activeStream.getVideoTracks()[0];

    if (!track) return;

    const capabilities = track.getCapabilities ? track.getCapabilities() : {};

    if (!capabilities.torch) {

        status("⚠️ Flash tidak didukung perangkat ini");

        return;

    }

    try {

        flashOn = !flashOn;

        await track.applyConstraints({
            advanced: [{ torch: flashOn }]
        });

    } catch (err) {

        console.log("Flash gagal diaktifkan", err);

    }

}

// ======================================
// ZOOM
// ======================================

async function ubahZoom(arah) {

    if (!activeStream) return;

    const track = activeStream.getVideoTracks()[0];

    if (!track) return;

    const capabilities = track.getCapabilities ? track.getCapabilities() : {};

    if (!capabilities.zoom) {

        status("⚠️ Zoom tidak didukung perangkat ini");

        return;

    }

    const step = 0.5;
    const min = capabilities.zoom.min;
    const max = capabilities.zoom.max;

    currentZoom = arah === "in"
        ? Math.min(max, currentZoom + step)
        : Math.max(min, currentZoom - step);

    try {

        await track.applyConstraints({
            advanced: [{ zoom: currentZoom }]
        });

        document.getElementById("zoomValue").textContent =
            currentZoom.toFixed(1) + "x";

    } catch (err) {

        console.log("Zoom gagal diterapkan", err);

    }

}

// ======================================
// SUKSES SCAN
// ======================================

function suksesScan() {

    if (navigator.vibrate) {

        navigator.vibrate(150);

    }

    beep.currentTime = 0;

    beep.play().catch(() => {});

    const reader =
        document.getElementById("reader");

    reader.classList.add(
        "scan-success"
    );

    setTimeout(() => {

        reader.classList.remove(
            "scan-success"
        );

    }, 400);

    status(
        "✅ Barcode berhasil dipindai"
    );

}

// ======================================
// STATUS
// ======================================

function status(text) {

    const el =
        document.getElementById("status");

    if (!el) return;

    el.style.display = "block";

    el.innerHTML = text;

}

// ======================================
// RESET SETELAH SIMPAN
// ======================================

function resetScanner() {

    lastResult = "";
    lastScanTime = 0;

}

// ======================================
// EVENT LISTENERS TOMBOL
// ======================================

window.addEventListener("load", () => {

    mulaiScanner();

    const flashBtn = document.getElementById("flashBtn");
    const zoomIn = document.getElementById("zoomIn");
    const zoomOut = document.getElementById("zoomOut");

    if (flashBtn) flashBtn.addEventListener("click", toggleFlash);
    if (zoomIn) zoomIn.addEventListener("click", () => ubahZoom("in"));
    if (zoomOut) zoomOut.addEventListener("click", () => ubahZoom("out"));

});
