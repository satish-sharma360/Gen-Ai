import readline from 'node:readline/promises'
import Groq from "groq-sdk";
import { tavily } from '@tavily/core'
import { stdin } from 'node:process';

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function main() {

    const rl = readline.createInterface({input:process.stdin , output:process.stdout})

    const messages = [
        {
            role: "system",
            content: `You are a smart Personal Assitant who answer ther asked question in better way and easy word and more focused.
                        you have access to following tools:
                        1. webSearch({query}) // Search the latest information and real time data on the internet.
                        current dateTime : ${new Date().toISOString()}`
        },
        // {
            // role: "user",
            // content: "When was iphone 16 launched?"
            // what is the current weather in Delhi?
            // When was iphone 16 launched?
        // }
    ]

    while (true) {

        const question = await rl.question("You: ");

        if (question === 'bye') {
            break;
        }

        messages.push({
            role:'user',
            content:question
        })
        while (true) {
            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                temperature: 0,
                messages: messages,
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
                tool_choice: 'auto'
            })

            messages.push(response.choices[0].message)

            const toolCalls = response.choices[0].message.tool_calls;
            // means get ans bcz agents always call tool whenever geting ans !toolcall means get ans
            if (!toolCalls) {
                console.log(`Assitence :${response.choices[0].message.content}`)
                break;
            }

            // means there is multiple tool 
            for (const tool of toolCalls) {
                // console.log('tool: ', tool)
                const functionName = tool.function.name;

                const args = tool.function.arguments;

                if (functionName === 'webSearch') {
                    const toolResult = await webSearch(JSON.parse(args))
                    // console.log('Tool Result:', toolResult)

                    messages.push({
                        tool_call_id: tool.id,
                        role: 'tool',
                        name: functionName,
                        content: toolResult
                    })
                }
            }

            // console.log(JSON.stringify(response.choices[0].message))
        }
    }
    rl.close();

}
main()

async function webSearch({ query }) {
    // here we do tavily api call
    console.log("calling web Search...")
    const response = await tvly.search(query);
    // console.log(response)
    const finalResult = response.results.map((result) => result.content).join("/n/n")

    // console.log("finalResult:", finalResult)
    return finalResult;
}