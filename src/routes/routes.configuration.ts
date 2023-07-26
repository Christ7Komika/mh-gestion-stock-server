import { Router } from "express";
import { ConfigurationController } from "../controllers/ConfigurationController";
const router = Router();

router.get("/init", ConfigurationController.init);
router.get("/", ConfigurationController.get);
router.get("/change", ConfigurationController.change);

export default router;
