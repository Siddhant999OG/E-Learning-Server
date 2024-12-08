const nodemailer = require("nodemailer");

const sendMail = async (email, subject, data) => {
    const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.Gmail,
            pass: process.env.password,
        },
    });

    const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <h2 style="color: #333;">Hello ${data.name},</h2>
            <p>Your OTP for E-learning is: <strong>${data.otp}</strong></p>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you,<br>E-learning Team</p>
        </div>
    `;

    await transport.sendMail({
        from: process.env.Gmail,
        to: email,
        subject,
        html,
    });
};

module.exports = sendMail;
