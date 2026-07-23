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


function buatHints(){


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
// START SCANNER
// ======================================


async function mulaiScanner(){


try{


status(
"📷 Membuka kamera..."
);



codeReader =
new ZXingBrowser.BrowserMultiFormatReader(
buatHints()
);



const video =
document.getElementById(
"cameraVideo"
);



if(!video){

status(
"❌ Video tidak ditemukan"
);

return;

}





const constraints={


video:{


facingMode:{


ideal:"environment"


},


width:{


ideal:1280


},


height:{


ideal:720


}


}



};






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

barcode===lastResult &&

(now-lastScanTime)<SCAN_DELAY

){

return;

}



lastResult=barcode;

lastScanTime=now;




document
.getElementById("barcode")
.value=barcode;



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



status(

"❌ Kamera gagal : "
+
error.name

);



}


}







// ======================================
// AUTO FOCUS
// ======================================


async function terapkanFocus(){



if(!activeStream)
return;



const track =
activeStream.getVideoTracks()[0];



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

catch(e){

console.log(
"Focus tidak didukung"
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




flashOn=!flashOn;




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




if(arah==="in"){


currentZoom=Math.min(

capabilities.zoom.max,

currentZoom+0.5

);



}else{


currentZoom=Math.max(

capabilities.zoom.min,

currentZoom-0.5

);


}





await track.applyConstraints({

advanced:[

{

zoom:currentZoom

}

]

});



document
.getElementById("zoomValue")
.innerText =
currentZoom.toFixed(1)+"x";


}








// ======================================
// SUKSES
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



const start =
document.getElementById(
"startCamera"
);



if(start){


start.onclick=function(){


mulaiScanner();


};


}




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



}

);