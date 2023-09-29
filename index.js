const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()

const port = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER_CAR}:${process.env.DB_PASS_CAR}@cluster0.kpsrg5b.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        // ADDED COLLECTION BY REZVI RAYHAN
        const ServiceCollection = client.db('DoctorsCar').collection('services')
        const BookingCollection = client.db('DoctorsCar').collection('bookings')

        // GET OPRATION 
        app.get('/services', async (req, res) => {
            const cursor = ServiceCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1, }
            }
            const result = await ServiceCollection.findOne(query, options)
            res.send(result)
        })


        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            // console.log(booking);
            const result = BookingCollection.insertOne(booking)
            res.send(result)

        })

        app.get('/bookings', async (req, res) => {
            console.log(req.query.email);
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await BookingCollection.find(query).toArray()
            res.send(result)
        })
        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await BookingCollection.deleteOne(query)
            res.send(result)
        })

        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);











app.get('/', (req, res) => {
    res.send('doctor is running')
})

app.listen(port, () => {
    console.log(`Car Doctor Server Is Running || Create Rezvi Rayhan ${port}`);
})