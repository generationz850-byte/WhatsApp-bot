// messageHandler.js

// This module handles incoming WhatsApp messages, processes commands, and sends responses.

const MessageHandler = {
    // Function to handle incoming messages
    handleIncomingMessage: function(message) {
        // Process commands
        const command = this.extractCommand(message);
        switch (command) {
            case 'HELP':
                this.sendResponse(message.from, 'Here are the commands you can use: ...');
                break;
            case 'TIME':
                this.sendResponse(message.from, `Current server time is: ${new Date().toUTCString()}`);
                break;
            default:
                this.sendResponse(message.from, 'Unknown command. Type HELP for instructions.');
        }
    },

    // Function to extract command from the message
    extractCommand: function(message) {
        if (message && message.text) {
            return message.text.toUpperCase().trim();
        }
        return null;
    },

    // Function to send a response back to the user
    sendResponse: function(to, responseText) {
        // Integrate with WhatsApp API to send response
        console.log(`Sending response to ${to}: ${responseText}`);
        // Example API call: WhatsAppAPI.sendMessage(to, responseText);
    }
};

module.exports = MessageHandler;