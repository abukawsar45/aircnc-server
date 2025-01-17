const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ccluster0.9lqzgjv.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true, 
  },
})

async function run() {
  try {
    const usersCollection = client.db('aircncDb').collection('users')
    const roomsCollection = client.db('aircncDb').collection('rooms')
    const bookingsCollection = client.db('aircncDb').collection('bookings')
    
    // -----------------POST----------------------------------------
    // post room data
    app.post('/rooms', async (req, res) => {
      const room = req.body
      console.log(room)
      const result = await roomsCollection.insertOne(room)
      // console.log(result)
      res.send(result)
    })

    // bookings
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      // console.log(result)
      res.send(result);
    });

    // -----------------GET----------------------------------------
    // get room data
    app.get('/rooms', async (req, res) => {
      const result = await roomsCollection.find().toArray()
      // console.log(result)
      res.send(result)
    })
  
    app.get('/room/:id', async (req, res) => {
      const id = req.params.id
      const query = {
        _id : new ObjectId(id)
      }
      const result = await roomsCollection.findOne(query)
      // console.log(result)
      res.send(result)
    })

    app.get('/rooms/:email', async (req, res) => {
      const email = req.params.email
      const query = { 'host.email': email }
      const result = await roomsCollection.find(query).toArray();
      console.log(result)
      res.send(result)
    })

    app.get('/bookings', async (req, res) => {
      const email = req.query.email;
      
      if (!email)
      {
        res.send([])
      }
      const query = { 'guest.email': email }
      const result = await bookingsCollection.find(query).toArray();
      res.send(result)
    } )

    // get user
     app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const query = {
        email: email
      }
      const result = await usersCollection.findOne(query)
      // console.log(result)
      res.send(result)
    })

    
    // -----------------UPDATE----------------------------------------
    // Save user email and role in DB
    app.put('/users/:email', async(req, res)=>{
      const email = req.params.email;
      const user = req.body
      const query = {email:email}
      const options = {upsert: true}
      const updateDoc = {
        $set: user
      }
      const result =await usersCollection.updateOne(query, updateDoc, options )
      console.log(result)
      res.send(result)
    })

    app.patch('/rooms/status/:id', async(req, res)=>{
      const id = req.params.id;
      const status = req.body.status;
      const query = { _id: new ObjectId(id)}
      const updateDoc = {
        $set: {
          booked: status
        }
      }
      const update =await roomsCollection.updateOne(query, updateDoc )
      console.log(update)
      res.send(update);
    })


    // -----------------DELETE----------------------------------------
    app.delete('/rooms/:id', async (req, res) => {
      const id = req.params.id
      const query = {
        _id: new ObjectId(id)
      }
      const result = await roomsCollection.deleteOne(query)
      console.log(result)
      res.send(result)
    })

    app.delete('/bookings/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await bookingsCollection.deleteOne(query)
      console.log(result)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('AirCNC Server is running..')
})

app.listen(port, () => {
  console.log(`AirCNC is running on port ${port}`)
})
