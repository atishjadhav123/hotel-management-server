const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static("dist"));
app.use(express.urlencoded({ extended: true }));

app.use(cors({ credentials: true, origin: true }));

// API Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/categori", require("./routes/categori.route"));
app.use("/api/booking", require("./routes/booking.route"));

// Handle unmatched API routes (JSON response)
app.use("/api/*", (req, res) => {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

// Serve React Frontend (for all non-API requests)
app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Server Error", error: err.message });
});


mongoose.connect(process.env.MONGO_URL)
mongoose.connection.once("open", () => {
    console.log("mongo connected")
    app.listen(process.env.PORT, console.log("server running")
    )

})






