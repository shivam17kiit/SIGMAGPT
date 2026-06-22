import "dotenv/config";

export const createEmbedding = async (text) => {
  return Array(768).fill(0);
};