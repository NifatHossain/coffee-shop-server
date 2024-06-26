const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

//middlewire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mtdunhe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("coffeeDB");
    const haiku = database.collection("haiku");

    const userCollection= client.db("coffeeDB").collection("userCollection");

    app.get("/coffees", async (req, res) => {
      const cursor = haiku.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await haiku.findOne(query);
      res.send(result);
    });

    app.put("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee= req.body;
      const coffee = {
        $set: {
          coffeeName: updatedCoffee.updatedCoffeeName,
          quantity:updatedCoffee.updatedQuantity,
          supplier:updatedCoffee.updatedSupplier,
          taste:updatedCoffee.updatedTaste,
          category:updatedCoffee.updatedCategory,
          details:updatedCoffee.updatedDetails,
          image:updatedCoffee.updatedImage
        },
      };
      const result = await haiku.updateOne(filter,coffee, options)
      res.send(result)
    });

    app.post("/coffees", async (req, res) => {
      const coffeeData = req.body;
      console.log(coffeeData);
      const result = await haiku.insertOne(coffeeData);
      res.send(result);
    });
    app.delete("/coffees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await haiku.deleteOne(query);
      res.send(result);
    });

    //firebase
    app.post('/user',async(req,res)=>{
      const user= req.body;
      console.log(user)
      const result= await userCollection.insertOne(user);
      res.send(result);
    })
    app.get('/users', async(req,res)=>{
      const cursor = userCollection.find();
      const result= await cursor.toArray();
      res.send(result);
    })
    app.delete('/user/:id',async(req,res)=>{
      const receivedId= req.params.id;
      const query = { _id: new ObjectId(receivedId)};
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })
    app.patch('/user', async(req,res)=>{
      const receivedEmail= req.body.email;
      const receivedLogInTime= req.body.logInAt;
      const filter = { email: receivedEmail };
      const updateDoc = {
        $set: {
          'last logIn': receivedLogInTime,
        }
      };
      const result = await userCollection.updateOne(filter, updateDoc)
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
