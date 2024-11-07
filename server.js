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

//Lesson Routes
app.get('/api/lessons', async (req, res) => {
    try{
        const lessons = await db.collection('lessons').find({}).toArray();
        res.json(lessons);
    }catch(error){
        res.status(500).json({message:error.message});
    }
});

app.patch('/api/lessons/:id', async (req, res) => {
    try{
        const result = await db.collection('lessons').updateOne(
            {_id: new ObjectId(req.params.id)},
            { $set: {spaces: req.body.spaces}}
        );
        if (result.matchedCount === 0){
            return res.status(404).json({message: "Lesson not found"});
        }
        const updatedLesson = await db.collection('lessons').findOne(
            {_id: new ObjectId(req.params.id) }
        );
        res.json(updatedLesson);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
});