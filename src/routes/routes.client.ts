import { Router } from "express";
import { ClientController } from "../controllers/ClientController";
import uploadImageFile from "../middlewares/multer";
const router = Router();

router.get("/:id", ClientController.index);
router.get("/", ClientController.all);
router.get("/history/add", ClientController.getHistory);
router.post("/", uploadImageFile, ClientController.create);
router.post("/find", ClientController.searchClient);
router.put("/:id", uploadImageFile, ClientController.update);
router.delete("/:id", ClientController.destroy);

export default router;
