var text = 'Unknown ...'
var conf = '...'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
    // use `await sleep(1000)` in async func
}

async function bbox(face, ctx, net){
    // top left x -- face.annotations.noseTip[0][0] - (bboxWidth/2)
    // top left y -- face.annotations.noseTip[0][1] - (bboxHeight/2)
    // bboxWidth  -- cheekLen*3
    // bboxHeight -- cheekLen*3

    // =======================================================================
    // Draw bbox
    // =======================================================================
    var cheekLen    = face.annotations.leftCheek[0][0] - face.annotations.rightCheek[0][0]
    var bboxHeight  = cheekLen * 3
    var bboxWidth   = cheekLen * 3    
    
    var bboxImg = ctx.getImageData(
        face.annotations.noseTip[0][0] - (bboxWidth/2), 
        face.annotations.noseTip[0][1] - (bboxHeight/2),
        bboxWidth, bboxHeight);
    

    var cheekLen    = face.annotations.leftCheek[0][0] - face.annotations.rightCheek[0][0]
    var bboxHeight  = cheekLen * 3
    var bboxWidth   = cheekLen * 3    

    var grad= ctx.createLinearGradient(50, 50, 150, 150);
    grad.addColorStop(0, "#00ff6a");
    grad.addColorStop(1, "#4fc7ff");

    var grad2= ctx.createLinearGradient(50, 50, 150, 150);
    grad2.addColorStop(0, "orange");
    grad2.addColorStop(1, "yellow");

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2

    var tlx = face.annotations.noseTip[0][0] - (bboxWidth/2)
    var tly = face.annotations.noseTip[0][1] - (bboxHeight/2)

    ctx.fillStyle = grad
    var unit = bboxWidth / (3*5.5)
    ctx.font = parseInt(unit).toString() + "px sans-serif";

    ctx.fillText("Detected: " + text, tlx+(unit/2), tly+unit);
    if (text === 'Unknown ...') {
        ctx.fillStyle = grad2
        ctx.fillText("Press respective button", tlx+(unit/2), tly+(2*unit));
        ctx.fillText("to register any face as A/B/C", tlx+(unit/2), tly+(3*unit));
    } else {
        ctx.fillStyle = grad
        ctx.fillText("confidence: " +  conf, tlx+(unit/2), tly+(2*unit));
        ctx.fillStyle = grad
        ctx.fillText("Click on respective button upto", tlx+(unit/2), tly+(3.5*unit));
        ctx.fillText("10-20 times for higher accuracy.", tlx+(unit/2), tly+(4.5*unit));
        ctx.fillText("Currently using naive model...", tlx+(unit/2), tly+(5.5*unit));
    }

    ctx.moveTo(tlx + (bboxWidth/3), tly);
    ctx.lineTo(tlx, tly);
    ctx.lineTo(tlx, tly + (bboxHeight/3));

    ctx.moveTo(tlx, tly + (2*bboxWidth/3));
    ctx.lineTo(tlx, tly + bboxWidth);
    ctx.lineTo(tlx + (bboxWidth/3), tly + bboxWidth);

    ctx.moveTo(tlx + (2*bboxWidth/3), tly);
    ctx.lineTo(tlx + bboxWidth, tly);
    ctx.lineTo(tlx + bboxWidth, tly + (bboxHeight/3));

    ctx.moveTo(tlx + bboxWidth, tly + (2*bboxHeight/3));
    ctx.lineTo(tlx + bboxWidth, tly + bboxHeight);
    ctx.lineTo(tlx + bboxWidth - (bboxWidth/3), tly + bboxHeight);

    ctx.stroke();
    

    const classes = ['Person A', 'Person B', 'Person C'];
    if (classifier.getNumClasses() > 0) {
        const img = await tf.browser.fromPixels(bboxImg)
        const activation = await net.infer(img, 'conv_preds');
        const result = await classifier.predictClass(activation);

        //console.log('Predicted:', classes[result.label])
        text  = classes[result.label] 
        var score  = parseFloat(result.confidences[result.label]) * 100
        conf = score.toString()
    }



    return bboxImg    
}