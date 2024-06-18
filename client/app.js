import bot from './public/bot.svg';
import user from './public/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(el){
    el.textContent = '';
    loadInterval = setInterval(() => {
       el.textContent += '.';

       if (el.textContent === '....'){
           el.textContent = '';
       }
    }, 300)
}

function typeText(el, text){
    let index = 0;

    let interval = setInterval(()=>{
        if(index<text.length){
            el.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    },20)
}

function generateUniqueId(){
    const timeStamp = Date.now();
    const randomNumber = Math.random()
    const hexString = randomNumber.toString((16));

    return `id-${timeStamp}-${hexString}`
}

function chatStrip (isAI, value, uniqueId){
    return (
        `
        <div class="wrapper ${isAI && 'ai'}">
        <div class="chat">
        <div class="profile">
        <img 
        src="${isAI ? bot : user}" 
        alt="${isAI ? 'bot' : 'user'}"
        />
</div>
<div class="message" id=${uniqueId}>${value}</div>
</div>
</div>
        `
    )
}

const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(form);

    //user's chat stripe
    chatContainer.innerHTML += chatStrip(false, data.get('prompt'));
    form.reset();

    //bot stripe
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStrip(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messagediv = document.getElementById(uniqueId);

    loader(messagediv);

    const response = await fetch('http://localhost:3000', {
        method: "POST",
        headers: {
            "Content-Type": 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })
    clearInterval(loadInterval)
    messagediv.innerHTML = '';

    if (response.ok){
        const data = await response.json();
        const parsedData = data.bot.trim();

        typeText(messagediv, parsedData);
    } else {
        const err = await response.text();
        messagediv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e)=>{
    if(e.keyCode === 13){
        handleSubmit(e);
    }
})