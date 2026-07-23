// ======================================
// INVENTARIS PT KAI
// SCANNER ENGINE V3.1 - ZXing QR OPTIMIZED
// ======================================

let codeReader;
let scannerControls;
let activeStream;

let lastResult = "";
let lastScanTime = 0;

let currentZoom = 1;
let flashOn = false;

const SCAN_DELAY = 2000;


// suara berhasil scan
const beep = new Audio(
    "https://actions.google.com/sounds/v1/cartoon/pop.ogg"
);


// ======================================
// ZXING HINTS
// QR CODE ASET PT KAI
// ======================================

function buatHints() {

    const hints = new Map();


    hints.set(
        ZXing.DecodeHintType.POSSIBLE_FORMATS,
        [
            ZXing.BarcodeFormat.QR_CODE,
            ZXing.BarcodeFormat.DATA_MATRIX
        ]
    );


    hints.set(
        ZXing.DecodeHintType.TRY_HARDER,
        true
    );


    return hints;

}


// ======================================
// MULAI SCANNER
// ======================================

async function mulaiScanner() {

    try {


        if (
            typeof ZXing === "undefined" ||
            typeof ZXingBrowser === "undefined"
        ) {

            status(
                "❌ Library scanner gagal dimuat"
            );

            return;

        }


        status(
            "📷 Membuka kamera..."
        );


        codeReader =
            new ZXingBrowser.BrowserMultiFormatReader(
                buatHints()
            );


        const constraints = {


            video: {

                facingMode: {

                    ideal: "environment"

                },


                width: {

                    ideal:1920

                },


                height: {

                    ideal:1080

                }

            }


        };


        const video =
            document.getElementById(
                "cameraVideo"
            );


        if(!video){

            status(
                "❌ Video kamera tidak ditemukan"
            );

            return;

        }



        scannerControls =
            await codeReader.decodeFromConstraints(

                constraints,

                video,


                (result,error)=>{


                    if(result){


                        const barcode =
                            result.text.trim();


                        const now =
                            Date.now();



                        if(
                            barcode === lastResult &&
                            now-lastScanTime < SCAN_DELAY
                        ){

                            return;

                        }



                        lastResult = barcode;

                        lastScanTime = now;



                        document.getElementById(
                            "barcode"
                        ).value = barcode;



                        suksesScan();

                    }


                }


            );



        if(video.srcObject){


            activeStream =
                video.srcObject;


            terapkanFocus();


        }



        status(
            "✅ Scanner siap"
        );



    }

    catch(error){


        console.error(error);



        if(error.name==="NotAllowedError"){

            status(
                "❌ Izin kamera ditolak"
            );

        }


        else if(error.name==="NotFoundError"){

            status(
                "❌ Kamera tidak ditemukan"
            );

        }


        else if(error.name==="NotReadableError"){

            status(
                "❌ Kamera sedang digunakan aplikasi lain"
            );

        }


        else{


            status(
                "❌ Kamera gagal dibuka : "
                + error.name
            );


        }


    }


}



// ======================================
// AUTOFOCUS
// ======================================


async function terapkanFocus(){


    if(!activeStream)
        return;



    const track =
        activeStream.getVideoTracks()[0];



    if(!track)
        return;



    try{


        const capabilities =
            track.getCapabilities();



        if(
            capabilities.focusMode &&
            capabilities.focusMode.includes(
                "continuous"
            )
        ){


            await track.applyConstraints({

                advanced:[

                    {

                        focusMode:
                        "continuous"

                    }

                ]

            });


        }



    }

    catch(error){


        console.log(
            "Autofocus tidak tersedia"
        );


    }


}



// ======================================
// FLASH
// ======================================


async function toggleFlash(){


    if(!activeStream)
        return;



    const track =
        activeStream.getVideoTracks()[0];



    const capabilities =
        track.getCapabilities();



    if(!capabilities.torch){


        status(
            "⚠️ Flash tidak tersedia"
        );


        return;

    }



    flashOn =
        !flashOn;



    await track.applyConstraints({

        advanced:[

            {

                torch:
                flashOn

            }

        ]

    });


}



// ======================================
// ZOOM
// ======================================


async function ubahZoom(arah){


    if(!activeStream)
        return;



    const track =
        activeStream.getVideoTracks()[0];



    const capabilities =
        track.getCapabilities();



    if(!capabilities.zoom){


        status(
            "⚠️ Zoom tidak tersedia"
        );


        return;

    }



    const step = 0.5;



    if(arah==="in"){


        currentZoom =
            Math.min(
                capabilities.zoom.max,
                currentZoom + step
            );


    }

    else{


        currentZoom =
            Math.max(
                capabilities.zoom.min,
                currentZoom - step
            );


    }



    await track.applyConstraints({

        advanced:[

            {

                zoom:
                currentZoom

            }

        ]

    });



    document.getElementById(
        "zoomValue"
    ).innerText =
        currentZoom.toFixed(1)+"x";


}



// ======================================
// BERHASIL SCAN
// ======================================


function suksesScan(){


    if(navigator.vibrate){

        navigator.vibrate(150);

    }


    beep.currentTime=0;


    beep.play()
    .catch(()=>{});



    status(
        "✅ Barcode berhasil dipindai"
    );


}



// ======================================
// STATUS
// ======================================


function status(text){


    const el =
        document.getElementById(
            "status"
        );


    if(el){

        el.innerHTML=text;

    }


}



// ======================================
// EVENT
// ======================================


window.addEventListener(
"load",
()=>{


    mulaiScanner();



    const flashBtn =
        document.getElementById(
            "flashBtn"
        );


    const zoomIn =
        document.getElementById(
            "zoomIn"
        );


    const zoomOut =
        document.getElementById(
            "zoomOut"
        );



    if(flashBtn)
        flashBtn.onclick =
        toggleFlash;



    if(zoomIn)
        zoomIn.onclick =
        ()=>ubahZoom("in");



    if(zoomOut)
        zoomOut.onclick =
        ()=>ubahZoom("out");


});