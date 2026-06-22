import { ChatGroq } from "@langchain/groq"
import { MemorySaver, START } from '@langchain/langgraph'
import { createAgent } from 'langchain'
import { TavilySearch } from "@langchain/tavily";
import { StateGraph ,MessagesAnnotation} from "@langchain/langgraph";
import * as z from "zod";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { printGraph } from "./utils.js";

/**
 * 1. Bring in LLM
 * 2. Build the graph
 * 3. invoke the agent
 * 4. add the memory
 */

// async function main() {
// ===============================
// LLM
// ===============================

const llm = new ChatGroq({
    model:"llama-3.3-70b-versatile",
    temperature:0
})

// ===============================
// Memory
// ===============================

// const checkpointer = new MemorySaver()



// ===============================
// Tools
// ===============================
const search = new TavilySearch({
    maxResults: 5,
    topic: 'general'
})
const calenderEvent = tool(
    async ({ query }) => {
        // Google calender logic goes
        return JSON.stringify([{
            title: "Meeting with INFRATECH",
            date: '20th jun 2026',
            time: "2 PM",
            location: "Delhi"
        }])
    },
    {
        name: 'get_calendar_events',
        description: 'Call to get the calender events',
        schema: z.object({
            query: z.string().describe("the Query to use in calender event search.")
        })
    }
)
const tools = [search, calenderEvent]

// ===============================
// Tool Node
// ===============================

const toolNode = new ToolNode(tools);

// ===============================
// LLM Node
// ===============================

const llmWithTools = llm.bindTools(tools)


async function callModel(state) {
    // call the LLM
    console.log("Caling LLM....")
    const response = await llmWithTools.invoke(state.messages)
    // console.log("Response in CallModel-->", response)
    return { messages: [response] };
}

function whereToGo(state){
    // check the previous ai message if tool call, return "tools"
    // else return "__end__"
    // console.log("message" , state.messages)

    const lastMessage = state.messages[state.messages.length - 1]

    if (lastMessage.tool_calls?.length) {
        return "tools"
    }
    return "__end__"
}
// ===============================
// Graph
// ===============================
const graph = new StateGraph(MessagesAnnotation)
.addNode("agent",callModel)
.addNode("tools",toolNode)
.addEdge("__start__","agent")
.addEdge("tools","agent")
.addConditionalEdges("agent" , whereToGo)

// ===============================
// Compile Graph
// ===============================

const app = graph.compile()
// const app = graph.compile({
//     checkpointer
// })

async function  main() {
    await printGraph(app)
    const response = await app.invoke({
        messages:[{role:'human', content:'What is the weather in Delhi?'}]
    })


    const messages = response.messages;
    const final = messages[messages.length - 1];

    console.log("Ai --> ", final.content)
}

main()