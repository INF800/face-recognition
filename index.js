async function setupCamera(videoElement) {
    const constraints = {video: {width: 320,height: 240}, audio: false};
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = stream;
    return new Promise(resolve => {
      videoElement.onloadedmetadata = () => {
        videoElement.play();
        resolve();
      };
    });
}


function scaleX(val){
    // 100.35234832763672, 123.83369445800781 >> 162.0299072265625, 88.43865203857422
    // 100*ratio = 162 (scaled) 
    var ratio = 162.03 / 100.35
    return val*ratio
}
function scaleY(val){
    // 100.35234832763672, 123.83369445800781 >> 162.0299072265625, 88.43865203857422
    // 123*ratio = 88 (scaled) 
    var ratio = 88.44 / 123.83
    return val*ratio
}

var loaded = false  
function startRender(input, output, model) {
    const ctx = output.getContext("2d");
    async function renderFrame() {
        requestAnimationFrame(renderFrame);
        const faces = await model.estimateFaces(input, false, false);
        ctx.clearRect(0, 0, output.width, output.height);
        faces.forEach(face => {

            if (!loaded){
                console.log(face)
                loaded = true
            }

            ctx.rect(
                scaleX(face.boundingBox.topLeft[0][0]), 
                scaleX(face.boundingBox.topLeft[0][1]), 
                scaleY(face.boundingBox.bottomRight[0][0]), 
                scaleY(face.boundingBox.bottomRight[0][1])
                );
            ctx.stroke();          
            
            face.scaledMesh.forEach(xy => {
                ctx.beginPath();
                ctx.arc(xy[0], xy[1], 1, 0, 2 * Math.PI);
                ctx.fill();
            });

        });
    }
    renderFrame();
}

function startBlaze(input, output, model) {
    const ctx = output.getContext("2d");
    async function renderFrame() {
        requestAnimationFrame(renderFrame);
        const preds = await model.estimateFaces(input, false); // retTensor=false
        console.log(preds)
        preds.forEach(face => {
            ctx.rect(face.topLeft[0], face.topLeft[1], face.bottomRight[0], face.bottomRight[1]);
            ctx.stroke(); 
        })

        ctx.clearRect(0, 0, output.width, output.height);
    }
    renderFrame()
}


function loading(onoff, id) {
    document.getElementById(id).style.display = onoff ? "inline" : "none";
}

async function start() {
    const input = document.getElementById("input");
    const output = document.getElementById("output");
    const output2 = document.getElementById("output2");
    
    loading(true, "loadingicon");
    loading(true, "loadingicon2");
    
    await setupCamera(input);
    const model = await facemesh.load({ maxFaces: 1 });
    const blaze = await blazeface.load();
    startRender(input, output, model);
    startBlaze(input, output2, blaze);

    loading(false, "loadingicon");
    loading(false, "loadingicon2");

}
