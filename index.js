import dotenv from "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/database/db-connect.js";
import { PORT } from "./src/utils/constants.js";
import chalk from "chalk";

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
