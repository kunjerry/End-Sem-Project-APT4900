import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = 3000;

// the finally fixed connectin scrpts guys - No TLS
const uri = process.env.MONGODB_URI;



app.use(express.json());

app.get('/', async (req, res) => {
  try {
    const client = new MongoClient(uri, { 
      serverSelectionTimeoutMS: 5000 
    });
    
    await client.connect();
    const db = client.db("DECCMSYSTEM");
    
    // Test by listing collections
    const collections = await db.listCollections().toArray();
    
    await client.close();
    
    res.json({
      success: true,
      message: "Connected to MongoDB!",
      collections: collections.map(c => c.name)
    });
    
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      tip: "Check IP whitelist in MongoDB Atlas"
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server fixed version running on http://localhost:${PORT}`);
});