const input = document.querySelector('#input')
const chatContainer = document.querySelector('#chat-container')
const askBtn = document.querySelector('#ask')

const threadId = Date.now().toString(36) + Math.random().toString(36).substring(2,8);

input?.addEventListener('keyup', handleEnter)
askBtn?.addEventListener('click', handleAsk)

const loading = document.createElement('div');
loading.className = 'my-6 animate-pulse';
loading.textContent = 'Thinking...'

async function generates(text) {

    const msg = document.createElement('div');
    msg.className = `my-6 bg-neutral-800 p-3 rounded-xl ml-auto max-w-fit`
    msg.textContent = text;

    chatContainer.appendChild(msg)

    input.value = '';

    chatContainer.appendChild(loading)
    // call server
    const assistantMessage = await callServer(text)

    const assistantMsgElm = document.createElement('div');
    assistantMsgElm.className = `max-w-fit`
    assistantMsgElm.innerHTML = marked.parse(assistantMessage);

    loading.remove()

    chatContainer.appendChild(assistantMsgElm)

}

async function callServer(inputText) {
    const response = await fetch("http://localhost:8888/chat", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: inputText ,threadId })
    })
    if (!response.ok) {
        throw new Error("Error generating the response")
    }

    const result = await response.json()
    return result.message;
}
async function handleAsk(e) {
    const text = input?.value.trim()

    if (!text) {
        return;
    }

    await generates(text)
}
async function handleEnter(e) {
    if (e.key === 'Enter') {

        const text = input?.value.trim()

        if (!text) {
            return;
        }


        await generates(text)

    }
}