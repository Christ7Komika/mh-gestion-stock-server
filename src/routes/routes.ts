import { Router } from "express";
import client from "./routes.client";
import supplier from "./routes.supplier";
import category from "./routes.category";
import warehouse from "./routes.warehouse";
import stall from "./routes.stall";
import articles from "./routes.articles";
const router = Router();

router.use("/client", client);
router.use("/supplier", supplier);
router.use("/category", category);
router.use("/warehouse", warehouse);
router.use("/stall", stall);
router.use("/articles", articles);

export default router;
