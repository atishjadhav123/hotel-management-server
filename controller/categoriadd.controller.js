const asyncHandler = require("express-async-handler")
const cloudinary = require("cloudinary").v2
const Categories = require("../models/Categories")
const { default: mongoose } = require("mongoose")
const path = require("path")

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

exports.addCategory = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" })
        }

        const result = await cloudinary.uploader.upload(req.file.path)

        await Categories.create({ ...req.body, image: result.secure_url })

        res.json({ message: "Category added successfully" })
    } catch (error) {
        console.error("Error adding category:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

exports.updateCategory = asyncHandler(async (req, res) => {
    try {
        // console.log("Request Params:", req.params)
        // console.log("Raw Body:", req.body)
        // console.log("Uploaded File:", req.file)

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid product ID" })
        }

        const oldCategory = await Categories.findById(req.params.id)
        if (!oldCategory) {
            return res.status(404).json({ error: "Category not found" })
        }

        let updatedImage = oldCategory.image

        if (req.body.remove === "true" && oldCategory.image) {
            const publicId = path.basename(oldCategory.image, path.extname(oldCategory.image))
            await cloudinary.uploader.destroy(publicId)
            updatedImage = null
        }

        if (req.file) {
            const uploadedImage = await cloudinary.uploader.upload(req.file.path)
            updatedImage = uploadedImage.secure_url
        }

        await Categories.findByIdAndUpdate(req.params.id, {
            ...req.body,
            image: updatedImage
        })

        res.json({ message: "Category updated successfully" })

    } catch (error) {
        console.error("Error updating category:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})


exports.deleteCategory = asyncHandler(async (req, res) => {
    try {

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Invalid category ID" })
        }

        const category = await Categories.findById(req.params.id)
        if (!category) {
            return res.status(404).json({ error: "Category not found" })
        }

        if (category.image) {
            const publicId = path.basename(category.image, path.extname(category.image))
            await cloudinary.uploader.destroy(publicId)
        }

        await Categories.findByIdAndDelete(req.params.id)

        res.json({ message: "Category deleted successfully" })

    } catch (error) {
        console.error("Error deleting category:", error)
        res.status(500).json({ error: "Internal Server Error" })
    }
})

exports.getAllcategory = asyncHandler(async (req, res) => {
    const result = await Categories.find()
    res.json({ message: "All category fetch success", result })
})
exports.getAllupdatecategory = asyncHandler(async (req, res) => {
    const { id } = req.params
    const result = await Categories.findOne({ _id: id })
    res.json({ message: "All category fetch success", result })
})
