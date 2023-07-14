import { Router } from "express";
import { ArticlesController } from "../controllers/ArticlesController";
import uploadImageFile from "../middlewares/multer";
const router = Router();

router.get("/:id", ArticlesController.index);
router.get("/", ArticlesController.all);
router.get("/history/add", ArticlesController.getHistory);
router.post("/history/filter", ArticlesController.filterHistoryByDate);
router.post("/", uploadImageFile, ArticlesController.create);
router.put("/:id", uploadImageFile, ArticlesController.update);
router.put("/add/:id", ArticlesController.addArticle);
router.put("/remove/:id", ArticlesController.removeArticle);
router.put("/change/storage/:id", ArticlesController.changeStorage);
router.put("/change/category/:id", ArticlesController.changeCategorie);
router.put("/change/supplier/:id", ArticlesController.changeSupplier);
router.put("/move/store/:id", ArticlesController.moveToStorage);
router.delete("/:id", ArticlesController.destroy);

export default router;
