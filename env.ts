import dotenv from "dotenv";

dotenv.config();

export default {
  hostname: process.env.HOST,
  port: process.env.PORT,
};
