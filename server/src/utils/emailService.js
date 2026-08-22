import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendQuizResultEmail = async ({
  email,
  studentName,
  quizTitle,
  score,
  totalPoints,
  percentage,
}) => {
  await transporter.sendMail({
    from: `"QuizForge" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Result - ${quizTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>QuizForge - Test Result</h2>

        <p>Hello ${studentName || "Student"},</p>

        <p>Your result for <strong>${quizTitle}</strong> is now available.</p>

        <div style="padding: 16px; background: #f8fafc; border-radius: 8px;">
          <p><strong>Score:</strong> ${score}/${totalPoints}</p>
          <p><strong>Percentage:</strong> ${percentage}%</p>
        </div>

        <p>Thank you for participating.</p>

        <p>Regards,<br />QuizForge</p>
      </div>
    `,
  });
};