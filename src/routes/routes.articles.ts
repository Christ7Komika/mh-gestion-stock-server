import { Router } from "express";
import { ArticlesController } from "../controllers/ArticlesController";
import uploadImageFile from "../middlewares/multer";
const router = Router();

router.get("/:id", ArticlesController.index);

router.get(
  "/suppliers/:id/:step/:skip/:search",
  ArticlesController.getBySupplier
);

router.get(
  "/categories/:id/:step/:skip/:search",
  ArticlesController.getByCategory
);

router.get(
  "/warehouses/:id/:step/:skip/:search",
  ArticlesController.getByWarehouse
);

router.get("/", ArticlesController.all);
router.get("/get/notification", ArticlesController.notification);
router.get("/get/warning", ArticlesController.warning);
router.post("/filter/data", ArticlesController.filter);
router.post("/search", ArticlesController.searchArticles);
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
