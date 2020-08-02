// ===============================================================
// Main
// ===============================================================
// must be global as we use it for inference too
const classifier    = knnClassifier.create();

const addExample = async (classId, pixelizedImg, net) => {
  // Same as taking input from <img> tag
  const img = tf.browser.fromPixels(await pixelizedImg)

  // Get the intermediate activation of MobileNet 'conv_preds' and pass that
  // to the KNN classifier.
  const activation = net.infer(img, 'conv_preds');

  // Pass the intermediate activation to the classifier.
  classifier.addExample(activation, classId);
  console.log('Added as class:', classId)

  // Dispose the tensor to release the memory.
  img.dispose();
  return
};