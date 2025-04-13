const express = require("express");
const app = express();
const PORT = process.env.PORT || 8800;
const cors = require("cors");
require("dotenv").config();
const path = require('path');

app.use(
  cors({
    origin: [/^http:\/\/localhost:\d+$/, "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const profileRoutes = require("./routes/profileRoutes");
const contactRoutes = require("./routes/contactRoutes");

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Profile Peek" });
});
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/contact", contactRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server start http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.message);
    process.exit(1);
  });

  module.exports = app;