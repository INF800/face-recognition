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

var loaded = false  
function startRender(input, output, output2, model) {
    const ctx = output.getContext("2d");
    const ctx2 = output2.getContext("2d");
    
    async function renderFrame() {
        requestAnimationFrame(renderFrame);
        const faces = await model.estimateFaces(input, false, false);
        ctx.clearRect(0, 0, output.width, output.height);
        ctx2.clearRect(0, 0, output2.width, output2.height);

        ctx2.beginPath();
        ctx2.drawImage(input, 0, 0, output2.width, output2.height)

        faces.forEach(face => {

            if (!loaded){
                console.log(face)
                loaded = true
            }

            bbox(face, ctx2);

            face.scaledMesh.forEach(xy => {
                ctx.beginPath();
                ctx.arc(xy[0], xy[1], 1, 0, 2 * Math.PI);
                ctx.fill();
            });

        });
    }
    renderFrame();
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
    startRender(input, output, output2, model);

    loading(false, "loadingicon");
    loading(false, "loadingicon2");

}
