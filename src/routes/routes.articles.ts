import { Router } from "express";
import { ArticlesController } from "../controllers/ArticlesController";
import uploadImageFile from "../middlewares/multer";
const router = Router();

router.get("/:id", ArticlesController.index);
router.get("/", ArticlesController.all);
router.post("/", uploadImageFile, ArticlesController.create);
router.put("/:id", uploadImageFile, ArticlesController.update);
router.delete("/:id", ArticlesController.destroy);

export default router;
