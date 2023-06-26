import { Router } from "express";
import client from "./routes.client";
const router = Router();

router.use("/client", client);

export default router;
