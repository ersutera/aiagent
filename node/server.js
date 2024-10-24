const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const OpenAI = require("openai");
const path = require("path");
require("dotenv").config();
const fs = require("fs");

const EventLog = require("./models/EventLog");
const Interaction = require("./models/Interaction");

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
})

mongoose.connect(process.env.MONGO_URI).then(() => {
	console.log("Successfully connected to MongoDB");
}).catch(error => {
	console.log(`Error connecting to MongoDB: ${error}`);
});

//Create server
const app = express();

//Use body parser and public directory
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

//Serve homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.post("/get-conversation-history", async (req, res) => {
    const { participantID } = req.body;  // Get Participant ID from the request body
    try {
        const conversationHistory = await Interaction.find({ participantID: participantID }); // Query interactions by Participant ID
        res.json({
          conversationHistory: conversationHistory
        });
    } catch (error) {
        console.log(`Error retrieving conversation history: ${error}`);
        res.sendStatus(500);
    }
});

//POST route for chat responses
app.post('/chat', async (req, res) => {
    const { userMessage, timestamp, participantID } = req.body; // Destructure participantID from the request body
    try {
        const request = {
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: userMessage
              }
            ],
            max_tokens: 200
        };
        
        const response = await openai.chat.completions.create(request);
        const botMessage = response.choices[0].message.content.trim();
        
        // Create new Interaction document with participantID
        const interaction = new Interaction({
          userInput: userMessage,
          botResponse: botMessage,
          timestamp: timestamp,
          participantID: participantID  // Include Participant ID
        });
        
        await interaction.save();
        res.json({
            botMessage: botMessage
        });
    } catch (error) {
        console.log(`Error serving chat response: ${error}`);
        res.sendStatus(500);
    }
});

app.post("/log-event", async (req, res) => {
    const { eventType, elementName, timestamp, participantID } = req.body; // Destructure participantID from the request body
    try {
        const event = new EventLog({
          eventType: eventType,
          elementName: elementName,
          timestamp: timestamp,
          participantID: participantID  // Include Participant ID
        });
        await event.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(`Error saving event log: ${error}`);
        res.sendStatus(500);
    }
});


app.post("/get-db", async (req, res) => {
	try {
		const documents = await Interaction.find();
		res.json({
			documents: documents
		});
	} catch (err) {
		console.log(`Error getting documents: ${error}`);
		res.sendStatus(500);
	}
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

