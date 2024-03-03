import dotenv from "dotenv/config";
import mongoose from "mongoose";
import chalk from "chalk";
import { DB_NAME } from "../utils/constants.js";

console.log(process.env)

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(chalk.bold.yellow(`\n✓ MongoDB connected successfully. \n`));
  } catch (error) {
    console.log(chalk.bold.red("MONGODB connection FAILED "), error);
    process.exit(1);
  }
};

export default connectDB;
