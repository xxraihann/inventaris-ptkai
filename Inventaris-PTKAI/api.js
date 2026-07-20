const API_URL = "https://script.google.com/macros/s/AKfycby6P0I_eMQxAAnb_6neqzvio_FVsQXy2TkBvZnSqcA3T8u7X05tCwvlYBODjdYrU7l1/exec";

async function simpanData() {

    const barcode = document.getElementById("barcode").value.trim();
    const namaBarang = document.getElementById("namaBarang").value.trim();
    const petugas = document.getElementById("petugas").value.trim();

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

    document.getElementById("status").innerHTML = "⏳ Menyimpan...";

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                barcode,
                namaBarang,
                petugas
            })
        });

        const result = await response.json();

        if (result.success) {

            document.getElementById("status").innerHTML =
                "✅ Data berhasil disimpan";

            document.getElementById("barcode").value = "";
            document.getElementById("namaBarang").value = "";
            document.getElementById("petugas").value = "";

            sudahScan = false;

            scanner.start(
                {
                    facingMode: "environment"
                },
                {
                    fps: 10,
                    qrbox: 250
                },
                onScanSuccess
            );

        } else {

            alert(result.message);

        }

    } catch (err) {

        console.error(err);

        document.getElementById("status").innerHTML =
            "❌ Gagal menghubungi server";

    }

}