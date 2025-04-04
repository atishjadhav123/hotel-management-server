const asyncHandler = require("express-async-handler");
const Booking = require("../models/Booking");
const { default: mongoose } = require("mongoose");

exports.createBooking = asyncHandler(async (req, res) => {
    console.log("Incoming Booking Data:", req.body);
    const { name, address, mobile } = req.body;

    const newBooking = new Booking({ name, address, mobile });
    await newBooking.save();

    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
});


exports.getBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate("authId", "name email"); // Get user details

    if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, booking });
});


exports.getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find().populate("authId", "name email");

    if (!bookings.length) {
        return res.status(404).json({ success: false, message: "No bookings found" });
    }

    res.status(200).json({ success: true, bookings })
});

exports.updateBooking = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
    }

    booking.status = status || booking.status;
    await booking.save();

    res.status(200).json({ success: true, message: "Booking updated successfully", booking });
});

exports.deleteBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
    }

    await booking.deleteOne();
    res.status(200).json({ success: true, message: "Booking deleted successfully" });
});
