const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// USE MIDDLEWARE

app.use(cors());
app.use(express.json());

// CONNECT WITH MONGODB
const uri = `mongodb+srv://cdpiweb:cdpiweb@cluster0.cokzf.mongodb.net/cdpiweb?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    client.connect();
    const database = client.db("cdpi");
    const noticeCollection = database.collection("notice");
    const usersCollection = database.collection("users");

    // GET all notice data

    app.get("/all-notice", async (req, res) => {
      const cursor = noticeCollection.find({});
      const notice = await cursor.toArray();
      res.json(notice);
    });

    // GET a single notice by ID

    app.get("/notice/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const notice = await noticeCollection.findOne(query);
      res.send(notice);
    });

    // GET admin or not

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "Admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // POST a single notice

    app.post("/add-notice", async (req, res) => {
      const notice = req.body;
      const result = await noticeCollection.insertOne(notice);
      res.json(result);
    });

    // POST a user

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // PUT user

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { user: user.email };
      const option = { upsert: true };
      const updateUser = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateUser,
        option
      );
      res.json(result);
    });

    // DELETE a single product by ID

    app.delete("/notice/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await noticeCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    // client.close()
  }
}

run().catch(console.dir);

app.get("/", (req, res) => res.send("Welcome to CDPI Server API"));
app.listen(port, () => console.log(`Server Running on localhost:${port}`));
