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
  
  function startRender(input, output, model) {
    const ctx = output.getContext("2d");
    async function renderFrame() {
      requestAnimationFrame(renderFrame);
      const faces = await model.estimateFaces(input, false, false);
      ctx.clearRect(0, 0, output.width, output.height);
      faces.forEach(face => {
        face.scaledMesh.forEach(xy => {
          ctx.beginPath();
          ctx.arc(xy[0], xy[1], 1, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
    }
    renderFrame();
  }
  
  function loading(onoff) {
    document.getElementById("loadingicon").style.display = onoff ? "inline" : "none";
  }
  
  async function start() {
    const input = document.getElementById("input");
    const output = document.getElementById("output");
    loading(true);
    await setupCamera(input);
    const model = await facemesh.load({ maxFaces: 1 });
    startRender(input, output, model);
    loading(false);
  }
  