const express = require ('express');
const { MongoClient, ObjectId} = require('mongodb');
const cors = require('cors');
require ('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db

async function connectToDatabase(){
    try{
        await client.connect();
        db = client.db('afterSchoolDB'); //This is the space for the database, don't forget to inser it
        console.log('Connected to Mongo db atlas');
    }catch(error){
        console.error('MongoDB connection error:', error)
    }
}
connectToDatabase();