import * as dotenv from "dotenv";
dotenv.config();

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Pinecone } from "@pinecone-database/pinecone";
import { pipeline } from "@xenova/transformers";

async function indexDocument() {
  // Load PDF
  const loader = new PDFLoader("./ml.pdf");
  const docs = await loader.load();

  console.log("Pages:", docs.length);

  // Split into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunks = await splitter.splitDocuments(docs);

  console.log("Chunks:", chunks.length);

  // Load embedding model (first run downloads model)
  console.log("Loading embedding model...");

  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-mpnet-base-v2"
  );

  // Pinecone
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  const index = pinecone.Index(process.env.PINECONE_INDEX);

  console.log("Generating embeddings...");

  const vectors = [];

  for (let i = 0; i < chunks.length; i++) {
    const output = await extractor(chunks[i].pageContent, {
      pooling: "mean",
      normalize: true,
    });

    const embedding = Array.from(output.data);

    console.log(
      `Chunk ${i + 1}/${chunks.length} -> Dimension: ${embedding.length}`
    );

    vectors.push({
      id: `chunk-${i}`,
      values: embedding,
      metadata: {
        text: chunks[i].pageContent,
      },
    });
  }

  console.log("Uploading to Pinecone...");

  await index.upsert(vectors);

  console.log("✅ Documents stored successfully!");
}

indexDocument().catch(console.error);