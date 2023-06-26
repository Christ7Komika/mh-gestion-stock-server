import { Router } from "express";
import { ClientController } from "../controllers/ClientController";

const router = Router();

router.get("/", ClientController.index);
router.get("/:id", ClientController.all);
router.post("/", ClientController.create);
router.delete("/:id", ClientController.destroy);

export default router;
