import * as tf from "@tensorflow/tfjs";

export const cosineSimilarity = (vecA, vecB) => {
  const a = tf.tensor(vecA);
  const b = tf.tensor(vecB);
  const dot = tf.sum(tf.mul(a, b));
  const normA = tf.norm(a);
  const normB = tf.norm(b);
  return dot.div(normA.mul(normB)).dataSync()[0];
};

export const findBestMatch = (scannedEmbedding, galleryEmbeddings) => {
  let bestMatch = { title: null, score: -1 };

  for (const art of galleryEmbeddings) {
    const score = cosineSimilarity(scannedEmbedding, art.embedding);
    if (score > bestMatch.score) {
      bestMatch = { title: art.title, score };
    }
  }

  return bestMatch;
};
