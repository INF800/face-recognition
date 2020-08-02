var AClicked = false
var BClicked = false
var CClicked = false
document.getElementById('class-a').addEventListener('click', () => { AClicked = true}); //addExample(0, bboxImg, net));
document.getElementById('class-b').addEventListener('click', () => { BClicked = true}); //addExample(1, bboxImg, net));
document.getElementById('class-c').addEventListener('click', () => { CClicked = true}); //addExample(2, bboxImg, net));
async function addExampleHandler(bboxImg, net){
    if (AClicked == true){
        await addExample(0, bboxImg, net)
        AClicked = false

    } else if (BClicked === true){
        await addExample(1, bboxImg, net)
        BClicked = false

    } else if (CClicked === true){
        await addExample(2, bboxImg, net)
        CClicked = false
    }
}

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
function startRender(input, output, output2, faceMeshModel, net) {
    const ctx = output.getContext("2d");
    const ctx2 = output2.getContext("2d");
    // loop
    async function renderFrame() {
        //await sleep(16) // It does the trick but blinky!
        requestAnimationFrame(renderFrame);
        const faces = await faceMeshModel.estimateFaces(input, false, false);
        ctx.clearRect(0, 0, output.width, output.height);
        ctx2.clearRect(0, 0, output2.width, output2.height);

        ctx2.beginPath();
        ctx2.drawImage(input, 0, 0, output2.width, output2.height)

        faces.forEach(async face => {


            face.scaledMesh.forEach(xy => {
                ctx.beginPath();
                ctx.arc(xy[0], xy[1], 1, 0, 2 * Math.PI);
                ctx.fill();
            });

            if (!loaded){
                console.log(face)
                loaded = true
            }

            var bboxImg = await bbox(face, ctx2, net);
            // console.log(tf.browser.fromPixels(bboxImg))
            // put on top left of canvas2:
            // ctx2.putImageData(bboxImg, -2, -2);
            await addExampleHandler(bboxImg, net)

        });
    }
    renderFrame();
}


function loading(onoff, id) {
    document.getElementById(id).style.display = onoff ? "inline" : "none";
}

function hideInit(){
    document.getElementById('init').style.display = 'none'
    document.getElementById('reg').style.display = 'block'
}

async function start() {
    const input         = document.getElementById("input");
    const output        = document.getElementById("output");
    const output2       = document.getElementById("output2");
    
    loading(true, "loadingicon");
    loading(true, "loadingicon2");
    
    await setupCamera(input);
    
    const faceMeshModel = await facemesh.load({ maxFaces: 1 });
    const net           = await mobilenet.load();

    startRender(input, output, output2, faceMeshModel, net);

    loading(false, "loadingicon");
    loading(false, "loadingicon2");
    hideInit()

}
