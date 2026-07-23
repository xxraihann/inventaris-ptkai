// ======================================
// INVENTARIS PT KAI
// SCANNER ENGINE V2.0
// ======================================

let codeReader;
let lastResult = "";
let lastScanTime = 0;

const SCAN_DELAY = 2000;

const beep = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
);

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

        codeReader = new ZXingBrowser.BrowserMultiFormatReader();

        status("📷 Membuka kamera...");

        await codeReader.decodeFromVideoDevice(
            selectedDevice.deviceId,
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

        setTimeout(optimasiKamera, 1500);

        status("✅ Scanner siap");

    }

    catch (error) {

        console.error(error);

        status("❌ Gagal membuka kamera");

    }

}

// ======================================
// OPTIMASI KAMERA
// ======================================

async function optimasiKamera() {

    try {

        const video =
            document.querySelector("#reader video");

        if (!video) return;

        const stream = video.srcObject;

        if (!stream) return;

        const track =
            stream.getVideoTracks()[0];

        const capabilities =
            track.getCapabilities();

        const constraints = {};

        // Autofocus
        if (capabilities.focusMode) {

            constraints.advanced = [
                {
                    focusMode: "continuous"
                }
            ];

        }

        // Resolusi tinggi
        constraints.width = { ideal: 1920 };
        constraints.height = { ideal: 1080 };

        await track.applyConstraints(
            constraints
        );

        console.log(
            "Kamera dioptimalkan"
        );

    }

    catch (err) {

        console.log(
            "Optimasi kamera tidak didukung",
            err
        );

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
// START
// ======================================

window.addEventListener(
    "load",
    mulaiScanner
);