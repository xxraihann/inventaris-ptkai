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

    const formData = new FormData();
    formData.append("barcode", barcode);
    formData.append("namaBarang", namaBarang);
    formData.append("petugas", petugas);

    try {

        const response = await fetch(API_URL, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.success) {

            document.getElementById("status").innerHTML =
                "✅ Data berhasil disimpan";

            document.getElementById("barcode").value = "";
            document.getElementById("namaBarang").value = "";
            document.getElementById("petugas").value = "";

            document.getElementById("historyList").innerHTML =
                "<div class='history-item'>✔ " + namaBarang + "</div>";

            sudahScan = false;

            mulaiScanner();

        } else {

            document.getElementById("status").innerHTML =
                "❌ " + result.message;

        }

    } catch (err) {

        console.error(err);

        document.getElementById("status").innerHTML =
            "❌ Gagal menghubungi server";

    }

}