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

//Order Routes
app.post('/api/orders', async (req, res) => {
    try {
        const order = {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            lessonIds: req.body.lessonIds.map(id => new ObjectId(id)),
            spaces: req.body.spaces,
            orderDate: new Date()
        };

        const result = await db.collection('orders').insertOne(order);
        res.status(201).json({ ...order, _id: result.insertedId });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await db.collection('orders').aggregate([
            {
                $lookup: {
                    from: 'lessons',
                    localField: 'lessonIds',
                    foreignField: '_id',
                    as: 'lessons'
                }
            }
        ]).toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
