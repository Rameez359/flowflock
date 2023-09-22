const {MongoClient} = require('mongodb');
require('dotenv').config();
const username = process.env.USER_NAME;
const password = process.env.PASSWORD;

const url = `mongodb+srv://${username}:${password}@cluster0.yznsam2.mongodb.net/?retryWrites=true&w=majority`;
let client;

async function connect() {
    if (!client) {
        client = new MongoClient(url);
        try {
            await client.connect();
            await client.db("xTwitter").command({ ping: 1 });// Send a ping to confirm a successful connection
            console.log(`Pinged your deployment. You successfully connected to MongoDB!`);
        } catch(error){
            console.error("Error in connection",error);
        }
    }
}
function getClient() {
    if (!client) {
        throw new Error('Database connection has not been established.');
    }
      return client;  
    }
module.exports = {
    connect,
    getClient
}
    // run().catch(console.dir)