let scanner;
let sudahScan = false;

function mulaiScanner() {

    scanner = new Html5Qrcode("reader");

    scanner.start(
        {
            facingMode: "environment"
        },
        {
            fps: 10,
            qrbox: 250
        },
        onScanSuccess,
        function(error){
            // abaikan error scanning
        }
    ).catch(err=>{
        document.getElementById("status").innerHTML =
        "❌ Kamera tidak dapat dibuka";
        console.log(err);
    });

}

function onScanSuccess(decodedText){

    if(sudahScan) return;

    sudahScan = true;

    document.getElementById("barcode").value = decodedText;

    if(navigator.vibrate){
        navigator.vibrate(200);
    }

    document.getElementById("status").innerHTML =
    "✅ Barcode berhasil dipindai";

    scanner.stop();

}

window.onload = function(){

    mulaiScanner();

}