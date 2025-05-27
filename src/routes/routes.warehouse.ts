import { Router } from "express";
import { WarehouseController } from "../controllers/WarehouseController";
const router = Router();

router.get("/:id", WarehouseController.index);
router.get("/", WarehouseController.all);
router.post("/", WarehouseController.create);
router.put("/:id", WarehouseController.update);
router.delete("/:id", WarehouseController.destroy);

export default router;
