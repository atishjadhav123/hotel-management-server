const mongoose = require("mongoose")

const authSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    password: { type: String, required: true },
    otp: { type: String },
    otpExpires: { type: Date },
    role: { type: String, enum: ["admin", "user"], default: "user" }
}, { timestamps: true })
module.exports = mongoose.model("auth", authSchema)