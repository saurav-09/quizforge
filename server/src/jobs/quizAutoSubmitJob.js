import cron from "node-cron";
import { autoSubmitExpiredAttempts } from "../utils/quizAutoSubmit.js";

const startQuizAutoSubmitJob = () => {
  cron.schedule("*/10 * * * * *", async () => {
    await autoSubmitExpiredAttempts();
  });

  console.log("Quiz auto-submit job started");
};

export default startQuizAutoSubmitJob;