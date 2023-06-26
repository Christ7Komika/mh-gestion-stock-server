import dotenv from "dotenv";

dotenv.config();

export default {
  hostname: process.env.HOSTNAME,
  port: process.env.PORT,
};
