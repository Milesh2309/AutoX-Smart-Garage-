const transporter = require("../config/mail");

const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw new Error(error?.message || 'Failed to send email');
  }
};

module.exports = sendEmail;