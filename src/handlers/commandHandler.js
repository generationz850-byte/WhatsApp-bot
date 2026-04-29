'use strict';

// Example command handlers
const commandHandlers = {
    '/start': () => {
        return 'Welcome to the bot! Use /help to see available commands.';
    },
    '/help': () => {
        return 'Available commands: /start, /help, /info';
    },
    '/info': () => {
        return 'This bot provides information and assistance.';
    },
    // Add more commands and their handlers here
};

// Command handling logic
const handleCommand = (command) => {
    if (commandHandlers.hasOwnProperty(command)) {
        return commandHandlers[command](); // Execute the corresponding handler
    }
    return 'Unknown command. Type /help for a list of commands.';
};

// Export the command handler function
module.exports = {
    handleCommand
};
