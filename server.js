import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import multer from "multer";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// fixed MongoDB connection - password encoding
let db, mongoClient;

async function connectToMongoDB() {
  try {
    console.log("🔗 Connecting to MongoDB Atlas...");
    
    
    const username = "garnetgithinji_db_user";
    const password = "Password123@";  
    const encodedPassword = encodeURIComponent(password);  
    
    const uri = `mongodb+srv://${username}:${encodedPassword}@deccm.b2yblee.mongodb.net/DECCMSYSTEM?retryWrites=true&w=majority`;
    
    console.log("📡 Using URI:", `mongodb+srv://${username}:***@deccm.b2yblee.mongodb.net/...`);
    
    mongoClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10
    });
    
    await mongoClient.connect();
    db = mongoClient.db("DECCMSYSTEM");
    
    // Test connection
    await db.command({ ping: 1 });
    console.log("✅ Connected to MongoDB Atlas!");
    console.log("Database:", db.databaseName);
    
    // Initialize collections
    await initializeCollections();
    
    return true;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    console.log("\n Please verify:");
    console.log("1. Password is correct: Password123@");
    console.log("2. IP 0.0.0.0/0 is whitelisted in MongoDB Atlas");
    console.log("3. User has 'Read and write to any database' permissions");
    return false;
  }
}

async function initializeCollections() {
  const collections = await db.listCollections().toArray();
  const collectionNames = collections.map(c => c.name);
  
  if (!collectionNames.includes("users")) {
    await db.createCollection("users");
    
    // Insert default users
    await db.collection("users").insertMany([
      {
        username: "admin",
        password: "admin123",
        fullName: "System Administrator",
        userRole: "admin",
        createdAt: new Date(),
        isActive: true
      },
      {
        username: "officer1",
        password: "officer123",
        fullName: "John Officer",
        userRole: "officer",
        createdAt: new Date(),
        isActive: true
      },
      {
        username: "analyst1",
        password: "analyst123",
        fullName: "Jane Analyst",
        userRole: "analyst",
        createdAt: new Date(),
        isActive: true
      },
      {
        username: "court1",
        password: "court123",
        fullName: "David Court",
        userRole: "court",
        createdAt: new Date(),
        isActive: true
      }
    ]);
    
    console.log("👤 Created default users:");
    console.log("   • Admin: admin / admin123");
    console.log("   • Officer: officer1 / officer123");
    console.log("   • Analyst: analyst1 / analyst123");
    console.log("   • Court: court1 / court123");
  }
  
  if (!collectionNames.includes("evidence")) {
    await db.createCollection("evidence");
    console.log("📁 Created 'evidence' collection");
  }
}

// Middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    if (!db) throw new Error("Database not connected");
    await db.command({ ping: 1 });
    
    res.json({
      success: true,
      status: "healthy",
      mongo: "connected",
      timestamp: new Date().toISOString(),
      message: "DECCMSYSTEM Server is running"
    });
  } catch (error) {
    res.json({
      success: false,
      status: "unhealthy",
      error: error.message
    });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.json({ 
        success: false, 
        message: "Username and password are required" 
      });
    }
    
    const user = await db.collection("users").findOne({ 
      username,
      isActive: true 
    });
    
    if (!user) {
      return res.json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }
    
    
    if (password !== user.password) {
      return res.json({ 
        success: false, 
        message: "Invalid username or password" 
      });
    }
    
    res.json({
      success: true,
      userId: user._id.toString(),
      username: user.username,
      fullName: user.fullName,
      userRole: user.userRole,
      message: "Login successful"
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});

// Serve HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin_dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin_dashboard.html"));
});

app.get("/officer_dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "officer_dashboard.html"));
});

// Get dashboard stats
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [users, evidence] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("evidence").countDocuments()
    ]);
    
    // Count officers
    const officers = await db.collection("users").countDocuments({ userRole: "officer" });
    
    // Count today's evidence
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEvidence = await db.collection("evidence").countDocuments({
      createdAt: { $gte: today }
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers: users,
        totalEvidence: evidence,
        activeOfficers: officers,
        todayUploads: todayEvidence
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent activity
app.get("/api/dashboard/activity", async (req, res) => {
  try {
    const recentEvidence = await db.collection("evidence")
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    
    const activity = recentEvidence.map(e => ({
      type: "evidence_upload",
      title: `New evidence uploaded: ${e.evidenceId}`,
      description: `Case: ${e.caseNumber}, Type: ${e.evidenceType}`,
      timestamp: e.createdAt,
      user: e.officerId
    }));
    
    res.json({
      success: true,
      activity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// Start server
async function startServer() {
  const connected = await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`\n🚀 DECCMSYSTEM Server running on http://localhost:${PORT}`);
    console.log(`📊 MongoDB Status: ${connected ? "✅ Connected" : "❌ Disconnected"}`);
    console.log(`\n🔗 Test URLs:`);
    console.log(`   • Login Page: http://localhost:${PORT}`);
    console.log(`   • Health Check: http://localhost:${PORT}/api/health`);
    console.log(`   • Login API Test: http://localhost:${PORT}/api/auth/login`);
    console.log(`\n👤 Test Credentials:`);
    console.log(`   • Admin: admin / admin123`);
    console.log(`   • Officer: officer1 / officer123`);
    console.log(`   • Analyst: analyst1 / analyst123`);
    console.log(`   • Court: court1 / court123`);
    console.log(`\n🔐 MongoDB User: garnetgithinji_db_user`);
    console.log(`🔐 MongoDB Password: Password123@`);
  });
}

startServer();