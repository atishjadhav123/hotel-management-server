const express = require("express");
const { createBooking, getBooking, getAllBookings, updateBooking, deleteBooking } = require("../controller/booking.controller");
const router = express.Router();


router.post("/create", createBooking)
router.get("/:id", getBooking)
router.get("/", getAllBookings)
router.put("/:id", updateBooking)
router.delete("/:id", deleteBooking)

module.exports = router;
