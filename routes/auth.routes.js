const { registerAdminWaiter, logoutAdminWaiter, resendOTP, verifyOTP, loginAdminWaiter } = require("../controller/auth.controller")
const { UserProtected } = require("../middlware/Protectted")

const router = require("express").Router()

router

    .post("/register-adminwaiter", registerAdminWaiter)
    .post("/login-adminwaiter", loginAdminWaiter)
    .post("/logout-adminwaiter", logoutAdminWaiter)
    .post("/resend-otp", resendOTP)
    .post("/verify-otp", verifyOTP)

module.exports = router