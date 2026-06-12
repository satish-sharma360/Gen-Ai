import Groq from "groq-sdk";

const groq = new Groq({apiKey:process.env.GROQ_API_KEY })

async function main(params) {
    let response = await groq.chat.completions.create({
        model:"llama-3.3-70b-versatile",
        messages:[
            {
                role:"system",
                content:"You are a Jarvis, a Smart personal assitant. Be always Polite"
            },
            {
                role:"user",
                content:"Who Are You?"
            },
        ],
    })
    console.log(response.choices[0].message.content)
}
// node --env-file=.env app.js
main()