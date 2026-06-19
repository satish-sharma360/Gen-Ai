import * as dotenv from "dotenv";
dotenv.config();

import readlineSync from 'readline-sync'
import { pipeline } from "@xenova/transformers";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY,});

const history = [];

async function main() {
    const userProblem = readlineSync.question("Ask me anything--> ")
    await chatting(userProblem)

}

async function chatting(question) {
    // convert this question into vector

    const extractor = await pipeline(
        "feature-extraction",
        "Xenova/all-mpnet-base-v2"
    )

    const output = await extractor(question,{
        pooling:"mean",
        normalize:true
    })

    const queryEmbedding = Array.from(output.data)

    // console.log("Dimension" , queryEmbedding.length);

    // pinecone connection

    const pinecone = new Pinecone({
        apiKey:process.env.PINECONE_API_KEY,
    })

    const index = pinecone.index(process.env.PINECONE_INDEX);

    // search

    const result = await index.query({
        vector:queryEmbedding,
        topK:5,
        includeMetadata:true,
    })

    // console.log(JSON.stringify(result.matches,null,2))

    const context = result.matches.map(match => match.metadata.text).join("\n\n---\n\n")
    // console.log(context)

    // gemini

    history.push({
        role:'user',
        parts:[{text:question}]
    })

    const response = await ai.models.generateContent({
        model:'gemini-2.5-flash-lite',
        contents: question,
        config:{
            systemInstruction:`You have to behave like a Machine learning Teacher.
            you will be given context of relevant information and a user question.
            your task is to answer ther user's question based ONLY on the provided context.
            if the answer is not in the context, you must say "I could not find the answer in the provided document."
            keep your answer clear, concise and educational
            
            context:${context}`
        },
    })
    history.push({
        role:"model",
        parts:[{text:response.text}]
    })

    console.log("\n")
    console.log(response.text)
}

main();