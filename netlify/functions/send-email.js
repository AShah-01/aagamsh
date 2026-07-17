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

        const apiKey = process.env.MAILGUN_API_KEY;
        const domain = process.env.MAILGUN_DOMAIN;
        const toEmail = process.env.MAIL_TO || "aagamshah250506@gmail.com";
        const fromEmail =
            process.env.MAIL_FROM || `Website Contact <postmaster@${domain}>`;

        if (!apiKey || !domain) {
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

        const formData = new URLSearchParams();
        formData.append("from", fromEmail);
        formData.append("to", toEmail);
        formData.append("subject", `${sanitizedSubject} - Website`);
        formData.append("text", textBody);
        formData.append("h:Reply-To", email);

        const authToken = Buffer.from(`api:${apiKey}`).toString("base64");
        const response = await fetch(
            `https://api.mailgun.net/v3/${domain}/messages`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${authToken}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formData,
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Mailgun error:", errorText);

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
