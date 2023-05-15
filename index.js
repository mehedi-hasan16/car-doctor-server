const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sv8l1qb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicesCollection = client.db("carDoctor").collection("services");
    const bookingCollection = client.db("carDoctor").collection("bookings");

    app.get('/services', async(req, res)=>{
        const carsor = servicesCollection.find();
        const result = await carsor.toArray(carsor);
        res.send(result);
    })

    app.get('/services/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)};
        const result = await servicesCollection.findOne(query)
        res.send(result);
    })

    //bookings
    app.post('/bookings', async (req,res)=>{
        const booking= req.body;
        console.log(booking);
        const result = await bookingCollection.insertOne(booking);
        res.send(result)
    })

    app.get('/bookings', async(req, res)=>{ 
        console.log(req.query);
        let query= {};
        if(req.query?.email){
            query= {email: req.query.email}
        }
        const result = await bookingCollection.find(query).toArray();
        res.send(result);
    })

    app.patch('/bookings/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updateBookings = req.body;
      console.log(updateBookings);
      const updateDoc ={
        $set:{
          status:updateBookings.status
        }
      }
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result)

    })
    
    app.delete('/bookings/:id', async(req, res)=>{
        const id = req.params.id;
        const query ={_id: new ObjectId(id)}
        const result = await bookingCollection.deleteOne(query);
        res.send(result);

    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('car doctor server is running')
})


app.listen(port, ()=>{
    console.log(`car doctor server is running on port ${port}`);
})