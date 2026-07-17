const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email configuration
// You can use Gmail, SendGrid, or any SMTP service
// For Gmail: enable "Less secure app access" or use App Password
// For production: Use environment variables for credentials
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER || "aadamsh.06@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "my_password_here",
    },
});

// Validate email configuration on startup
if (!process.env.EMAIL_PASSWORD && process.env.NODE_ENV === "production") {
    console.error("ERROR: EMAIL_PASSWORD environment variable is not set!");
    process.exit(1);
}

app.post("/api/send-email", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        // Sanitize inputs
        const sanitizedName = String(name).trim().substring(0, 100);
        const sanitizedEmail = String(email).trim().toLowerCase();
        const sanitizedSubject = String(subject).trim().substring(0, 200);
        const sanitizedMessage = String(message).trim().substring(0, 5000);

        // Create email content
        const emailSubject = `${sanitizedSubject} - Website`;
        const emailBody = `
You have received a new message from your website contact form.

From: ${sanitizedName}
Email: ${sanitizedEmail}
Subject: ${sanitizedSubject}
Message Source: Website Contact Form

------- Message -------

${sanitizedMessage}

------- End of Message -------

This message was sent from your website's contact form.
    `;

        const mailOptions = {
            from: process.env.EMAIL_USER || "aadamsh.06@gmail.com",
            to: process.env.EMAIL_USER || "aadamsh.06@gmail.com",
            replyTo: sanitizedEmail,
            subject: emailSubject,
            text: emailBody,
            html: `
        <h2>New Website Contact Message</h2>
        <p><strong>From:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
        <p><strong>Subject:</strong> ${sanitizedSubject}</p>
        <p><strong>Source:</strong> Website Contact Form</p>
        <hr />
        <h3>Message:</h3>
        <p>${sanitizedMessage.replace(/\n/g, "<br />")}</p>
        <hr />
        <p><small>This message was sent from your website's contact form.</small></p>
      `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: "Email sent successfully!",
        });
    } catch (error) {
        console.error("Email send error:", error);
        return res.status(500).json({
            success: false,
            message:
                "Failed to send email. Please try again or email directly.",
        });
    }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "Server is running" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Email service: ${process.env.EMAIL_SERVICE || "gmail"}`);
});
