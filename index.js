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

            var cheekLen = face.annotations.leftCheek[0][0] - face.annotations.rightCheek[0][0]
            var bboxHeight =  cheekLen * 3
            var bboxWidth  =  cheekLen * 3    

            var grad= ctx2.createLinearGradient(50, 50, 150, 150);
            grad.addColorStop(0, "#00ff6a");
            grad.addColorStop(1, "#4fc7ff");
            ctx2.strokeStyle = grad;

            /*ctx2.strokeRect(
            face.annotations.noseTip[0][0] - (bboxWidth/2),
            face.annotations.noseTip[0][1] - (bboxHeight/2),
            bboxWidth, bboxHeight);
            */
            var tlx = face.annotations.noseTip[0][0] - (bboxWidth/2)
            var tly = face.annotations.noseTip[0][1] - (bboxHeight/2)
            
            ctx2.moveTo(tlx + (bboxWidth/3), tly);
            ctx2.lineTo(tlx, tly);
            ctx2.lineTo(tlx, tly + (bboxHeight/3));

            ctx2.moveTo(tlx, tly + (2*bboxWidth/3));
            ctx2.lineTo(tlx, tly + bboxWidth);
            ctx2.lineTo(tlx + (bboxWidth/3), tly + bboxWidth);

            ctx2.moveTo(tlx + (2*bboxWidth/3), tly);
            ctx2.lineTo(tlx + bboxWidth, tly);
            ctx2.lineTo(tlx + bboxWidth, tly + (bboxHeight/3));

            ctx2.moveTo(tlx + bboxWidth, tly + (2*bboxHeight/3));
            ctx2.lineTo(tlx + bboxWidth, tly + bboxHeight);
            ctx2.lineTo(tlx + bboxWidth - (bboxWidth/3), tly + bboxHeight);

            ctx2.stroke();
            


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
