// Connecting to MongoDB

const { MongoClient } = require('mongodb');

const uri = 'your_mongo_db_connection_string';
const client = new MongoClient(uri);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

module.exports = { connectToDatabase };