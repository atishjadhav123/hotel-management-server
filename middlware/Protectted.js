const jwt = require("jsonwebtoken")

exports.UserProtected = async (req, res, next) => {
    try {
        console.log("Cookies:", req.cookies)


        const token = req.cookies.hotel
        if (!token) {
            return res.status(401).json({ message: "No Cookie Found" })
        }

        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Unauthorized: Invalid Token", error: err.message })
            }

            req.user = decoded.userId
            next()
        })

    } catch (error) {
        console.error("UserProtected Error:", error)
        res.status(500).json({ message: error.message || "User Protected Error" })
    }
}
