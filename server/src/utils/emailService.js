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
  <div style="margin: 0; padding: 40px 16px; background: #f8fafc; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">

      <div style="padding: 24px; background: #4f46e5; color: #ffffff;">
        <h2 style="margin: 0; font-size: 22px;">
          QuizForge
        </h2>

        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">
          Test Result
        </p>
      </div>

      <div style="padding: 28px;">
        <p style="margin-top: 0; color: #111827;">
          Hello ${studentName || "Student"},
        </p>

        <p style="color: #4b5563; line-height: 1.6;">
          Your result for
          <strong style="color: #111827;">
            ${quizTitle}
          </strong>
          is now available.
        </p>

        <div style="margin: 24px 0; padding: 20px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px;">

          <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
            Your Score
          </p>

          <p style="margin: 0; font-size: 28px; font-weight: bold; color: #111827;">
            ${score} / ${totalPoints}
          </p>

          <p style="margin: 8px 0 0; color: #4f46e5; font-weight: bold;">
            ${percentage}%
          </p>

        </div>

        <p style="color: #4b5563; line-height: 1.6;">
          You can log in to QuizForge to view your complete result
          and review your answers.
        </p>

        <p style="margin-bottom: 0; color: #4b5563;">
          Thank you for participating.
        </p>

        <p style="margin-top: 24px; color: #111827;">
          Regards,<br />
          <strong>QuizForge</strong>
        </p>
      </div>

    </div>
  </div>
`,
  });
};