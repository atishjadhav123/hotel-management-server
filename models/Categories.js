const mongoose = require("mongoose");

const CategoriSchema = new mongoose.Schema({
    rating: { type: Number },
    image: { type: String },
    available: { type: Boolean, default: true },
    category: {
        type: String,
        enum: ["veg", "non-veg"],
        required: true,
    },
    price: { type: Number, required: true },
    title: { type: String, required: true },
});

module.exports = mongoose.model("Category", CategoriSchema);
