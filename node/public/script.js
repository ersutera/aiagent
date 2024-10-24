const messagesContainer = document.getElementById("messages");
const inputField = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const form = document.getElementById("chat-form");

const participantID = localStorage.getItem('participantID');
console.log(participantID);  // This will log the Participant ID to the console

document.addEventListener('DOMContentLoaded', () => {
    const participantID = localStorage.getItem('participantID');
    if (participantID) {
        console.log(`Participant ID: ${participantID}`);
        // You can also display it in the UI if needed
    } else {
        console.log('No Participant ID found');
    }
});

async function submitPrompt(event) {
    event.preventDefault();
    const prompt = inputField.value;
    if (!prompt) {
        alert("Prompt is empty");
        return;
    }
    
    // Retrieve Participant ID from localStorage
    const participantID = localStorage.getItem('participantID');

    messagesContainer.innerHTML += `User: ${prompt}<br>`;
    inputField.value = "";

    const response = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userMessage: prompt,
            timestamp: new Date(),
            participantID: participantID  // Add Participant ID to the request
        })
    });

    const { botMessage } = await response.json();
    console.log(botMessage);
    messagesContainer.innerHTML += `Bot: ${botMessage}<br>`;
}

async function fetchConversationHistory() {
    const participantID = localStorage.getItem('participantID');
    if (participantID) {
        const response = await fetch("/get-conversation-history", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ participantID })
        });

        if (response.ok) {
            const { conversationHistory } = await response.json();
            conversationHistory.forEach(interaction => {
                messagesContainer.innerHTML += `User: ${interaction.userInput}<br>`;
                messagesContainer.innerHTML += `Bot: ${interaction.botResponse}<br>`;
            });
        } else {
            console.log("Failed to fetch conversation history");
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display the conversation history when the page loads
    fetchConversationHistory();
});

async function logEvent(event, element) {
	const response = await fetch("/log-event", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			eventType: event,
			elementName: element,
			timestamp: new Date()
		})
	});
	console.log(response);
}

async function getDB() {
	const response await fetch("/get-db" {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			timestamp
		})
	});
	console.log(response.documents);
}

if(form) {
	form.addEventListener("submit", submitPrompt);
}

if(inputField) {
	inputField.addEventListener("keypress", (event) => {
		if(event.key === "Enter") {
			submitPrompt(event);
		}
	});
	inputField.addEventListener("mouseover", () => {
		logEvent("hover", "User Input");
	});
	inputField.addEventListener("focus", () => {
		logEvent("focus", "User Input");
	});
}

if(sendBtn) {
	sendBtn.addEventListener("mouseover", () => {
		logEvent("hover", "sendBtn");
	})
	sendBtn.addEventListener("click", () => {
		logEvent("click", "Send Button");
	});
}

