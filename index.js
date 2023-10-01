const express = require('express');
const jwt = require('jsonwebtoken');
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

const verifyJwt = (req, res, next) => {
    // console.log('JWF Fucking Hitting');
    // console.log(req.headers.authorization);
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401)({ error: true, message: "UnAuthorize" })
    }
    const token = authorization.split(' ')[1]
    // console.log('Token Inside Verify Me', token);
    jwt.verify(token, process.env.ACCES_TOKEN_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: "UnAuthorize" })
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {

        // ADDED COLLECTION BY REZVI RAYHAN
        const ServiceCollection = client.db('DoctorsCar').collection('services')
        const BookingCollection = client.db('DoctorsCar').collection('bookings')

        // START JWT 

        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user);
            const token = jwt.sign(user, process.env.ACCES_TOKEN_KEY, {
                expiresIn: '1h',
            });
            console.log(token);
            res.send({ token })

        })


        // END JWT 



        // START CLIENT SITE 
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

        app.get('/bookings', verifyJwt, async (req, res) => {
            const decoded = req.decoded
            console.log('comeback after verify', decoded);
            if (decoded.email !== req.query.email) {
                return res.status(401).send({ eror: 1, message: 'Forbidden Access' })
            }
            console.log(req.headers.authorization);
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await BookingCollection.find(query).toArray()
            res.send(result)
        })
        app.patch('/bookings/:id', async (req, res) => {
            const updateBooking = req.body
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            // console.log(updateBooking);
            const updateDoc = {
                $set: {
                    status: updateBooking.status
                }

            }
            const result = await BookingCollection.updateOne(filter, updateDoc)
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