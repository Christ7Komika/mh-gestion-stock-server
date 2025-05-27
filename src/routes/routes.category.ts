import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
const router = Router();

router.get("/:id", CategoryController.index);
router.get("/", CategoryController.all);
router.post("/", CategoryController.create);
router.put("/:id", CategoryController.update);
router.delete("/:id", CategoryController.destroy);

export default router;
