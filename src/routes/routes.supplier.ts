import { Router } from "express";
import { SupplierController } from "../controllers/SupplierController";
import uploadImageFile from "../middlewares/multer";
const router = Router();

router.get("/:id", SupplierController.index);
router.get("/", SupplierController.all);
router.post("/", uploadImageFile, SupplierController.create);
router.post("/find", SupplierController.searchSuppliers);
router.put("/:id", uploadImageFile, SupplierController.update);
router.delete("/:id", SupplierController.destroy);

export default router;
