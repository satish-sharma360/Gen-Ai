import Groq from "groq-sdk";

const groq = new Groq({apiKey:process.env.GROQ_API_KEY })

async function main(params) {
    let response = await groq.chat.completions.create({
        model:"llama-3.3-70b-versatile",
        messages:[
            {
                role:"system",
                content:"You are a Jarvis, You are a Sentiment Analyzer you analyze sentiment base on review Sentiment Classify the review as Positive , Neutral or Negative. your task to return single word output"
            },
            {
                role:"user",
                content:`Review: There headphones arrived quickly and look great, but the left earcup stopped working after a week.
                         Sentiment:`,
            },
        ],
    })
    console.log(response.choices[0].message.content)
}
// node --env-file=.env app.js
main()