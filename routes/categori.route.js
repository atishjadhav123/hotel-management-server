const { addCategory, updateCategory, deleteCategory, getAllcategory, getAllupdatecategory } = require("../controller/categoriadd.controller")
const { upload } = require("../utils/upload")

const router = require("express").Router()

router
    .post("/categori-add", upload, addCategory)
    .put("/update-categori/:id", upload, updateCategory)
    .delete("/delete-categori/:id", upload, deleteCategory)
    .get("/getallupdatecategory/:id", getAllupdatecategory)
    .get("/getallcategory", getAllcategory)

module.exports = router