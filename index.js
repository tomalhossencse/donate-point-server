const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 4000;

// middleware
app.use(express.json());
app.use(cors());
// mongo db
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vybtxro.mongodb.net/?appName=Cluster0`;

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
    await client.connect();

    const db = client.db("DonerPointDB");
    const donerCollection = db.collection("doners");
    const howItworksCollection = db.collection("howItWorks");

    // api

    app.post("/doners", async (req, res) => {
      const doner = req.body;
      const result = await donerCollection.insertOne(doner);
      res.send(result);
    });

    // single doner by id

    app.get("/doners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donerCollection.findOne(query);
      res.send(result);
    });

    // delete doner api

    app.delete("/doners/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await donerCollection.deleteOne(query);
      res.send(result);
    });

    // get doners

    app.get("/doners", async (req, res) => {
      const contributorEmail = req.query.contributerEmail;
      let query = {};
      if (contributorEmail) {
        query = { contributerEmail: contributorEmail };
      }
      try {
        const result = await donerCollection
          .find(query)
          .sort({ createAt: -1 })
          .toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching doners:", error);
        res.status(500).send({ message: "Failed to fetch donor data." });
      }
    });
    // get latest doner
    app.get("/latest-doners", async (req, res) => {
      const result = await donerCollection
        .find()
        .sort({ createAt: -1 })
        .limit(3)
        .toArray();
      res.send(result);
    });

    // howItworks api

    app.get("/howItworks", async (req, res) => {
      const result = await howItworksCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "✅Pinged your deployment. You successfully connected to MongoDB!"
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
