import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 5005;
const jwtSecret = process.env.JWT_SECRET || "your_secret_key";

// Debugging: Ensure environment variables are loaded
console.log(" Starting Server...");
console.log(" MongoDB URI:", process.env.MONGO_URI ? "Loaded" : "Not Found");
console.log(" JWT Secret:", process.env.JWT_SECRET ? "Loaded" : "Not Found");

// MongoDB Connection Function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if no response
    });

    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// MongoDB Connection Event Handlers (For Debugging)
mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connection Established!");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected!");
});

// Middleware
app.use(cors());
app.use(express.json());

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true }, // 🔥 Ensures unique emails
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "⚠️ All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "❌ Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "✅ User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error registering user", error: err });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "⚠️ Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "❌ User not found!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "❌ Invalid password!" });
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: "1h" });
    res.json({ message: "✅ Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "❌ Server error", error });
  }
});

// Create a default user (if not exists)
const createDefaultUser = async () => {
  const existingUser = await User.findOne({ email: "vivi@gmail.com" });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("123", 10);
    await new User({ username: "Vivi", email: "vivi@gmail.com", password: hashedPassword }).save();
    console.log("✅ Default user created: vivi@gmail.com / 123");
  }
};
createDefaultUser();

// Flashcard Schema & Model
const flashcardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  level: { type: String, required: true },
  flipCount: { type: Number, default: 0 },
  isFlipped: { type: Boolean, default: false },
});

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

// Get all flashcards
app.get("/flashcards", async (req, res) => {
  try {
    const flashcards = await Flashcard.find();
    res.json(flashcards);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching flashcards", error: err });
  }
});

// Add a flashcard
app.post("/flashcards", async (req, res) => {
  const { question, answer, level } = req.body;

  if (!question || !answer || !level) {
    return res.status(400).json({ message: "⚠️ All fields are required" });
  }

  try {
    const newFlashcard = new Flashcard({ question, answer, level });
    await newFlashcard.save();
    res.status(201).json({ message: "✅ Flashcard added", flashcard: newFlashcard });
  } catch (err) {
    res.status(500).json({ message: "❌ Error adding flashcard", error: err });
  }
});

// Update a flashcard
app.put("/flashcards/:id", async (req, res) => {
  const { id } = req.params;
  const { question, answer, level } = req.body;

  if (!question || !answer || !level) {
    return res.status(400).json({ message: "⚠️ All fields are required" });
  }

  try {
    const updatedFlashcard = await Flashcard.findByIdAndUpdate(
      id,
      { question, answer, level },
      { new: true }
    );
    if (updatedFlashcard) {
      res.json({ message: "✅ Flashcard updated", flashcard: updatedFlashcard });
    } else {
      res.status(404).json({ message: "❌ Flashcard not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "❌ Error updating flashcard", error: err });
  }
});

// Delete a flashcard
app.delete("/flashcards/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFlashcard = await Flashcard.findByIdAndDelete(id);
    if (deletedFlashcard) {
      res.json({ message: "✅ Flashcard deleted", flashcard: deletedFlashcard });
    } else {
      res.status(404).json({ message: "❌ Flashcard not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting flashcard", error: err });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
