exports.handler = async (event) => {
    const defaultHeaders = {
        "Content-Type": "application/json",
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers: {
                ...defaultHeaders,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: "",
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: defaultHeaders,
            body: JSON.stringify({
                success: false,
                message: "Method not allowed",
            }),
        };
    }

    try {
        const payload = JSON.parse(event.body || "{}");
        const name = String(payload.name || "").trim();
        const email = String(payload.email || "")
            .trim()
            .toLowerCase();
        const subject = String(payload.subject || "").trim();
        const message = String(payload.message || "").trim();
        const company = String(payload.company || "").trim();

        // Honeypot: likely bot submission
        if (company) {
            return {
                statusCode: 200,
                headers: defaultHeaders,
                body: JSON.stringify({
                    success: true,
                    message: "Message sent.",
                }),
            };
        }

        if (!name || !email || !subject || !message) {
            return {
                statusCode: 400,
                headers: defaultHeaders,
                body: JSON.stringify({
                    success: false,
                    message: "All fields are required",
                }),
            };
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return {
                statusCode: 400,
                headers: defaultHeaders,
                body: JSON.stringify({
                    success: false,
                    message: "Invalid email address",
                }),
            };
        }

        const apiKey = process.env.RESEND_API_KEY;
        const toEmail = process.env.MAIL_TO || "aagamshah250506@gmail.com";
        // Until a custom domain is verified in Resend, sends must come from
        // this shared onboarding address - swap in your own once verified,
        // e.g. "Website Contact <contact@yourdomain.com>"
        const fromEmail =
            process.env.MAIL_FROM || "Website Contact <onboarding@resend.dev>";

        if (!apiKey) {
            return {
                statusCode: 500,
                headers: defaultHeaders,
                body: JSON.stringify({
                    success: false,
                    message: "Mail service is not configured",
                }),
            };
        }

        const sanitizedName = name.slice(0, 100);
        const sanitizedSubject = subject.slice(0, 200);
        const sanitizedMessage = message.slice(0, 5000);

        const textBody = [
            "You have received a new message from your website contact form.",
            "",
            `From: ${sanitizedName}`,
            `Email: ${email}`,
            `Subject: ${sanitizedSubject}`,
            "",
            "------- Message -------",
            "",
            sanitizedMessage,
            "",
            "------- End of Message -------",
        ].join("\n");

        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: fromEmail,
                to: [toEmail],
                reply_to: email,
                subject: `${sanitizedSubject} - Website`,
                text: textBody,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Resend error:", errorText);

            return {
                statusCode: 502,
                headers: defaultHeaders,
                body: JSON.stringify({
                    success: false,
                    message: "Failed to send message",
                }),
            };
        }

        return {
            statusCode: 200,
            headers: defaultHeaders,
            body: JSON.stringify({
                success: true,
                message: "Email sent successfully",
            }),
        };
    } catch (error) {
        console.error("Function error:", error);

        return {
            statusCode: 500,
            headers: defaultHeaders,
            body: JSON.stringify({
                success: false,
                message: "Unexpected server error",
            }),
        };
    }
};
