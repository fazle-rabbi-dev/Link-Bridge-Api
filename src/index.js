import dotenv from "dotenv/config";
import app from "./app.js";
import connectDB from "./database/db-connect.js";
import chalk from "chalk";
import { PORT } from "./utils/constants.js";

(async () => {
  await connectDB();

  app.listen(PORT, err => {
    if (!err) {
      console.log(chalk.bold.magenta("✓ Server started at: http://localhost:" + PORT));
    } else {
      console.log(chalk.bold.red("✘ Failed to start server! Try again."));
    }
  });
})();
