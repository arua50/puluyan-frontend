import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs";

let model;

// Load MobileNet model
export const loadModel = async () => {
  if (!model) model = await mobilenet.load();
  return model;
};

// Extract feature embeddings
export const getEmbedding = async (imageElement) => {
  const model = await loadModel();
  const activation = model.infer(imageElement, true);
  return activation.arraySync();
};
