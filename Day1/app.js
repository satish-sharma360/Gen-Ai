import Groq from "groq-sdk";

const groq = new Groq({apiKey:process.env.GROQ_API_KEY })

async function main() {
    let response = await groq.chat.completions.create({
        temperature:1, // default 1 , this is between 0 to 2 for creativity go toward 2 and for more focus and deterministic go toward 0 
        // top_p:0.2, between 0 to 1 use any one top_p and temperature
        stop:"ga", // for stoping generatinon
        /**
         * 1. item 1
         * 2. item 2
         * 3. item 3
         * ....
         * 10. item 10
         * 11. item 11
         * now stop here if i am generating list type think
         */
        frequency_penalty:1,
        presence_penalty:1,
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