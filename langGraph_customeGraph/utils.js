import * as fs from "node:fs/promises";

export async function printGraph(agent) {
    const drawableGraph = await agent.getGraphAsync();
    const image = await drawableGraph.drawMermaidPng();
    const imageBuffer = new Uint8Array(await image.arrayBuffer());

    await fs.writeFile("./graph.png", imageBuffer);
}