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
    
    const classes = ['Person A', 'Person B', 'Person C'];
    var text = 'Unknown ...'
    if (classifier.getNumClasses() > 0) {
        const img = await tf.browser.fromPixels(bboxImg)
        const activation = await net.infer(img, 'conv_preds');
        const result = await classifier.predictClass(activation);

        //console.log('Predicted:', classes[result.label])
        text = classes[result.label]
    }

    return [text, bboxImg]    
}