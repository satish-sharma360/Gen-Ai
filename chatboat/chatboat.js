import Groq from "groq-sdk";
import { tavily } from '@tavily/core'
import NodeCache from "node-cache";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const chache = new NodeCache({stdTTL:60 * 60 * 24}) // 24 hours

export async function generateFunction(userMessage ,threadId) {


    const baseMessage = [
        {
            role: "system",
            content: `You are a smart Personal Assitant who answer ther asked question in better way and easy word and more focused.
                        you have access to following tools:
                        Always return plain text.
                        Do not use markdown.
                        Do not use **bold**, lists, tables, or headings
                        1. webSearch({query}) // Search the latest information and real time data on the internet.
                        current dateTime : ${new Date().toISOString()}`
        },
    ]

    const message = chache.get(threadId)?? baseMessage;

    message.push({
        role: 'user',
        content: userMessage
    })
    const MAX_RETRIES = 10;
    let count = 0;

    while (true) {

        if(count > MAX_RETRIES){
            return "I could not find the result, please try again";
        }
        count++;
        
        const response = await groq.chat.completions.create({
            model: "openai/gpt-oss-120b",
            temperature: 0,
            messages: message,
            "tools": [
                {
                    "type": "function",
                    "function": {
                        "name": "webSearch",
                        "description": "Search the latest information and real time data on the internet.",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "query": {
                                    "type": "string",
                                    "description": "The Search Query to perform search on."
                                }
                            },
                            "required": ["query"]
                        }
                    }
                }
            ],
            tool_choice: "auto"
        })
        message.push(response.choices[0].message)

        const toolCalls = await response.choices[0].message.tool_calls

        if (!toolCalls) {
            // here we end the chatbot response
            chache.set(threadId , message);
            return response.choices[0].message.content

        }

        for (const tool of toolCalls) {
            const functionName = tool.function.name;

            const args = tool.function.arguments;

            if (functionName === 'webSearch') {
                const toolResult = await webSearch(JSON.parse(args));

                message.push({
                    tool_call_id: tool.id,
                    role: 'tool',
                    name: functionName,
                    content: toolResult
                })
            }
        }
    }

}


async function webSearch({ query }) {
    // console.log("calling web Search...")

    const response = await tvly.search(query)

    const finalResult = response.results.map((result) => result.content).join('/n/n')

    return finalResult
}