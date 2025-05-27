import { Router } from "express";
import { ConfigurationController } from "../controllers/ConfigurationController";
const router = Router();

router.get("/init", ConfigurationController.init);
router.get("/", ConfigurationController.get);
router.post("/change", ConfigurationController.change);
router.get("/reset", ConfigurationController.reset);

export default router;
