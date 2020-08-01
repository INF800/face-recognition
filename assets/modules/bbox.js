function bbox(face, ctx){
    /*ctx.strokeRect(
    face.annotations.noseTip[0][0] - (bboxWidth/2),
    face.annotations.noseTip[0][1] - (bboxHeight/2),
    bboxWidth, bboxHeight);
    */
    var cheekLen    = face.annotations.leftCheek[0][0] - face.annotations.rightCheek[0][0]
    var bboxHeight  = cheekLen * 3
    var bboxWidth   = cheekLen * 3    

    var grad= ctx.createLinearGradient(50, 50, 150, 150);
    grad.addColorStop(0, "#00ff6a");
    grad.addColorStop(1, "#4fc7ff");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2

    var tlx = face.annotations.noseTip[0][0] - (bboxWidth/2)
    var tly = face.annotations.noseTip[0][1] - (bboxHeight/2)
    
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
}