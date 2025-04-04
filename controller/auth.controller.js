const Auth = require("../models/Auth")
const { checkempty } = require("../utils/checkempty")
const jwt = require("jsonwebtoken")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const asyncHandler = require("express-async-handler")
const sendEmail = require("../utils/email")

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

exports.registerAdminWaiter = asyncHandler(async (req, res) => {
    const { name, email, mobile, password, adminEmail } = req.body

    const { isError, error } = checkempty({ name, email, password, mobile, })
    if (isError) return res.status(400).json({ message: "All fields are required", error })

    if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid Email" })
    if (!validator.isStrongPassword(password)) return res.status(400).json({ message: "Provide a strong password" })
    if (!validator.isMobilePhone(mobile, "en-IN")) return res.status(400).json({ message: "Invalid mobile number" })
    // if (!["admin", "user"].includes(role)) return res.status(400).json({ message: "Invalid role. Choose 'admin' or 'user'." })

    const existingUser = await Auth.findOne({ $or: [{ email }, { mobile }] })
    if (existingUser) {
        return res.status(400).json({ message: "Email or mobile number already registered" })
    }

    // if (role === "admin") {
    //     if (!adminEmail) {
    //         return res.status(403).json({ message: "Only an existing admin can register another admin." })
    //     }
    //     const existingAdmin = await Auth.findOne({ email: adminEmail, role: "admin" })
    //     if (!existingAdmin) {
    //         return res.status(403).json({ message: "Unauthorized! Only admins can register another admin." })
    //     }
    // }

    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000)
    const hashpass = await bcrypt.hash(password, 10)

    await Auth.create({ name, email, mobile, password: hashpass, otp, otpExpires })

    await sendEmail({ email, subject: "Your Waiter Registration OTP Code", otp })

    res.json({ message: `registration successful. OTP sent to email.`, otp })
})

exports.loginAdminWaiter = asyncHandler(async (req, res) => {
    try {
        const { email, password, } = req.body
        const user = await Auth.findOne({ email });

        const isfound = await Auth.findOne({ email });
        if (!isfound) return res.status(400).json({ message: "Email or mobile not found" });

        const isVerify = await bcrypt.compare(password, isfound.password);
        if (!isVerify) return res.status(400).json({ message: "Password does not match" });

        // ✅ Check if OTP is required (first-time login only)
        // if (!isfound.isOtpVerified) {
        //     if (!otp) return res.status(400).json({ message: "OTP is required for first-time login" });

        //     if (isfound.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

        //     if (isfound.otpExpires < Date.now()) return res.status(400).json({ message: "OTP has expired" });

        //     // ✅ Mark OTP as verified so it won’t be required next time
        //     isfound.isOtpVerified = true;
        // }

        // ✅ Generate JWT token
        const token = jwt.sign({ userId: isfound._id, role: isfound.role }, process.env.JWT_KEY, { expiresIn: "15d" });

        // ✅ Set cookie with token
        res.cookie("hotel", token, {
            maxAge: 1000 * 60 * 60 * 24 * 15,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
        });

        // // ✅ Clear OTP fields in DB
        // isfound.otp = null;
        // isfound.otpExpires = null;
        // await isfound.save();

        res.json({
            message: `${isfound.role} login successful`,
            result: {
                _id: isfound._id,
                name: isfound.name,
                email: isfound.email,
                mobile: isfound.mobile,
                role: user.role,
                // role: isfound.role,
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})


exports.resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ message: "Valid email is required" })
    }

    const user = await Auth.findOne({ email })
    if (!user) return res.status(400).json({ message: "User not found" })

    const newOTP = generateOTP()
    user.otp = newOTP
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    await sendEmail({ email, subject: "Your New OTP Code", otp: newOTP })

    res.json({ message: "New OTP sent successfully" })
})

exports.verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body

    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" })

    const user = await Auth.findOne({ email })
    if (!user || user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" })

    user.otp = null
    await user.save()

    res.json({ message: "OTP verified successfully" })
})

exports.logoutAdminWaiter = asyncHandler(async (req, res) => {
    res.clearCookie("hotel")
    res.json({ message: "Logout successful" })
})

exports.updateCategory = asyncHandler(async (req, res) => {
    upload(req, res, async err => {
        try {
            console.log("Request Params:", req.params);
            console.log("Raw Body:", req.body);
            console.log("Uploaded File:", req.file); // ✅ Debugging uploaded file

            // Check if the provided ID is valid
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ error: "Invalid product ID" });
            }

            // Fetch existing category
            const oldCategory = await Categories.findById(req.params.id);
            if (!oldCategory) {
                return res.status(404).json({ error: "Category not found" });
            }

            let updatedImage = oldCategory.image; // Keep old image by default

            // Handle Image Removal
            if (req.body.remove === "true" && oldCategory.image) {
                const publicId = path.basename(oldCategory.image, path.extname(oldCategory.image));
                await cloudinary.uploader.destroy(publicId);
                updatedImage = null; // Remove the old image
            }

            // **Ensure File Exists Before Uploading to Cloudinary**
            if (req.file && req.file.path) {
                console.log("Uploading to Cloudinary:", req.file.path);
                try {
                    const uploadedImage = await cloudinary.uploader.upload(req.file.path);
                    updatedImage = uploadedImage.secure_url;
                } catch (uploadError) {
                    console.error("Cloudinary Upload Error:", uploadError);
                    return res.status(500).json({ error: "Cloudinary Upload Failed" });
                }
            }

            // Update category
            await Categories.findByIdAndUpdate(req.params.id, {
                ...req.body,
                image: updatedImage
            });

            res.json({ message: "Category updated successfully" });

        } catch (error) {
            console.error("Error updating category:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    })
});
