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
        await addExample(3, bboxImg, net)
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
        await sleep(16) // It does the trick but blinky!
        requestAnimationFrame(renderFrame);
        const faces = await faceMeshModel.estimateFaces(input, false, false);
        ctx.clearRect(0, 0, output.width, output.height);
        ctx2.clearRect(0, 0, output2.width, output2.height);

        ctx2.beginPath();
        ctx2.drawImage(input, 0, 0, output2.width, output2.height)

        faces.forEach(async face => {

            if (!loaded){
                console.log(face)
                loaded = true
            }

            var [text, bboxImg] = await bbox(face, ctx2, net);
            // console.log(tf.browser.fromPixels(bboxImg))
            // put on top left of canvas2:
            // ctx2.putImageData(bboxImg, -2, -2);
            console.log('must be before addition')
            await addExampleHandler(bboxImg, net)
            console.log('must be after addition')
            
            
            
            
            console.log(text)
            
            console.log('>>before box')

            var cheekLen    = face.annotations.leftCheek[0][0] - face.annotations.rightCheek[0][0]
            var bboxHeight  = cheekLen * 3
            var bboxWidth   = cheekLen * 3    

            var grad= ctx2.createLinearGradient(50, 50, 150, 150);
            grad.addColorStop(0, "#00ff6a");
            grad.addColorStop(1, "#4fc7ff");
        
            var grad2= ctx2.createLinearGradient(50, 50, 150, 150);
            grad2.addColorStop(0, "orange");
            grad2.addColorStop(1, "yellow");
        
            ctx2.strokeStyle = grad;
            ctx2.lineWidth = 2
        
            var tlx = face.annotations.noseTip[0][0] - (bboxWidth/2)
            var tly = face.annotations.noseTip[0][1] - (bboxHeight/2)
        
            ctx2.fillStyle = grad
            var unit = bboxWidth / (3*6)
            ctx2.font = parseInt(unit).toString() + "px sans-serif";

            ctx2.fillText(text, tlx+unit, tly+(2*unit));
            console.log(text, 'written in bbox')
            console.log(ctx)
            /*if (text === 'Unknown ...') {
                ctx2.fillStyle = grad2
                ctx2.fillText("Press respective button", tlx+unit, tly+(3*unit));
                ctx2.fillText("to add this face", tlx+unit, tly+(4*unit));
            }*/
        
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

            console.log('>>after box')


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
