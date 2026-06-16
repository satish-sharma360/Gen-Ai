import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function main() {
    const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: [
            {
                role: "system",
                content: `You are a smart Personal Assitant who answer ther asked question in better way and easy word and more focused.
                        you have access to following tools:
                        1. webSearch({query}) // Search the latest information and real time data on the internet`
            },
            {
                role: "user",
                content: "When was iphone 16 launched?"
                // what is the current weather in Delhi?
                // When was iphone 16 launched?
            }
        ],
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
        tool_choice:'auto'
    })
    const toolCalls = response.choices[0].message.tool_calls;
    // means get ans bcz agents always call tool whenever geting ans !toolcall means get ans
    if (!toolCalls) {
        console.log(`Assitence :{response.choices[0].message.content}`)
        return;
    }

    // means there is multiple tool 
    for(const tool of toolCalls){
        console.log('tool: ' , tool)
        const functionName = tool.function.name;

        const args = tool.function.arguments;

        if (functionName === 'webSearch') {
            const toolResult = await webSearch(JSON.parse(args))
            console.log('Tool Result:' , toolResult)
        }
    }
    // console.log(response.choices[0].message)
    // console.log(JSON.stringify(response.choices[0].message))
    
}
main()

async function webSearch({ query }) {
    // here we do tavily api call
    console.log("calling web Search...")
    return "Iphone was launched 20 september 2024."
}