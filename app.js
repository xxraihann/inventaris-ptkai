let scanner;
let sudahScan = false;

function mulaiScanner() {

    scanner = new Html5Qrcode("reader");

    scanner.start(
        {
            facingMode: "environment"
        },
        {
            fps: 15,
            qrbox: {
                width: 250,
                height: 250
            },
            aspectRatio: 1.0
        },
        onScanSuccess,
        function (error) {
            // Abaikan error scanning
        }
    ).catch(err => {

        console.log(err);

        document.getElementById("status").innerHTML =
            "❌ Kamera tidak dapat dibuka";

    });

}

async function onScanSuccess(decodedText) {

    if (sudahScan) return;

    sudahScan = true;

    document.getElementById("barcode").value = decodedText;

    if (navigator.vibrate) {
        navigator.vibrate(200);
    }

    const audio = new Audio(
        "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
    );
    audio.play();

    document.getElementById("status").innerHTML =
        "✅ Barcode berhasil dipindai";

    try {
        await scanner.stop();
    } catch (e) {
        console.log(e);
    }

}

function scanLagi() {

    sudahScan = false;

    mulaiScanner();

}

window.onload = function () {

    mulaiScanner();

};