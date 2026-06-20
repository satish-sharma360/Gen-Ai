import { ChatGroq } from "@langchain/groq";
import { createAgent } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import { tool } from "@langchain/core/tools";
import * as z from "zod";
import readline from 'readline/promises'
import { MemorySaver } from "@langchain/langgraph";

async function main() {
    const model = new ChatGroq({
        model: "openai/gpt-oss-120b",
        temperature: 0,
    });

    const search = new TavilySearch({
        maxResults: 3,
        topic: "general",
    })

    const calenderEvents = tool(
        async ({ query }) => {
            // Google calender goes here
            return JSON.stringify([
                {
                    title: "Meeting with sujoy",
                    date: "19 Jun 2026",
                    time: '2pm',
                    location: 'Delhi',
                }
            ]);
        },
        {
            name: 'get-calender-event',
            description: "Call to get the calender events",
            schema: z.object({
                query: z.string().describe("the Query to use in calender event search."),
            }),
        }
    )
    const checkpointer = new MemorySaver()

    const agent = createAgent({
        model: model,
        tools: [search, calenderEvents],
        checkpointer:checkpointer,
    })
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    while (true) {
        const userQuery = await rl.question("You--> ")
        if (userQuery === 'bye') {
            break;
        }
        const result = await agent.invoke({
            messages: [
                {
                    role: 'system',
                    content: `You are a Personal assistant. Use Provided tools to get the information if you don't have it. Current date and time : ${new Date().toUTCString()}`
                },
                {
                    role: 'user',
                    content: userQuery
                }
            ]
        },{configurable:{thread_id :'1'}})
        console.log("AI: ", result.messages[result.messages.length - 1].content)
    }
    rl.close()

    // console.log("result: ", result)
}

main()
 