import express from "express";
import cors from "cors";
import morgan from "morgan";
import env from "../env";
import router from "./routes/routes";
import { prisma } from "./model/prisma";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/image", express.static("./src/upload"));
app.use(router);

app.on("", () => {
  prisma.$disconnect();
});

app.listen(env.port, () => {
  console.log(`Program starting on ${env.hostname}:${env.port}`);
});
