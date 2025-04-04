const nodeMailer = require("nodemailer");

const sendEmail = async ({ email, subject, otp }) => {
    return new Promise((resolve, reject) => {
        const transporter = nodeMailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.FROM_EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to: email,
            subject: subject,
            html: `<h3>Your OTP Code is: <b>${otp}</b></h3>`, // Email body
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Unable to send email:", err);
                reject("Email sending failed");
            } else {
                console.log("Email sent successfully:", info.response);
                resolve("Email sent successfully");
            }
        });
    });
};

module.exports = sendEmail;
