import { Router } from "express";
import client from "./routes.client";
import supplier from "./routes.supplier";
import category from "./routes.category";
import warehouse from "./routes.warehouse";
import articles from "./routes.articles";
import ticket from "./routes.ticket";
import configuration from "./routes.configuration";
const router = Router();

router.use("/client", client);
router.use("/supplier", supplier);
router.use("/category", category);
router.use("/warehouse", warehouse);
router.use("/articles", articles);
router.use("/ticket", ticket);
router.use("/configuration", configuration);
export default router;
