// Function to connect Backend and Frontendd
async function mainFunctioning() {

    const userInput = document.getElementById("chat").value;

    if (userInput.trim() === "") {
        alert("Please enter a message.");
        return;
    }
    
    document.getElementById("chat").value = '';

    displayMessage(userInput, 'user');

    // Send the input to the FastAPI
    try {
        const response = await fetch(`/chatbot?${new Date().getTime()}`, { // Cache Busting to avoid failure of POST method
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                parts: userInput,
                history: JSON.parse(localStorage.getItem('chatHistory') || '[]'),
            }),
        });

        const data = await response.json();

        displayMessage(data.response, 'bot');

        // Update chat history in localStorage
        const history = JSON.parse(localStorage.getItem('chatHistory') || '[]');
        history.push({ role: 'user', parts: userInput });
        history.push({ role: 'model', parts: data.response });
        localStorage.setItem('chatHistory', JSON.stringify(history));
    } catch (error) {
        console.error("Error:", error);
        alert("Something went wrong. Please try again.");
    }
}

// Function to display Conversation of User and the Bot
function displayMessage(message, sender) {
    const chatBox = document.querySelector('.mainChat');
    
    document.getElementById("loader").style.visibility = "hidden";
    
    const messageDiv = document.createElement('p');
    messageDiv.classList.add(sender === 'user' ? 'userMessage' : 'botMessage');
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    
    chatBox.scrollTop = chatBox.scrollHeight;
}

const send = document.getElementById("send");
const chat = document.getElementById("chat");

// Event Listeners for Search
send.addEventListener('click', async function() {
    await mainFunctioning();
});

chat.addEventListener('keydown', function(event) {
    if (event.key === "Enter") {
        mainFunctioning();
    }
});

// Function to capitalize the First Letter of Input
function capitalizeFirstLetter(event) {
    const inputField = event.target;
    const value = inputField.value;

    inputField.value = value.charAt(0).toUpperCase() + value.slice(1);
}

chat.addEventListener("input", capitalizeFirstLetter);