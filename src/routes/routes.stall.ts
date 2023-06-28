import { Router } from "express";
import { StallController } from "../controllers/StallController";
const router = Router();

router.get("/:id", StallController.index);
router.get("/", StallController.all);
router.post("/", StallController.create);
router.put("/:id", StallController.update);
router.delete("/:id/:name", StallController.destroy);

export default router;
