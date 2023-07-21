import { Router } from "express";
import { TicketController } from "../controllers/TicketController";
const router = Router();

router.get("/:id", TicketController.index);
router.get("/", TicketController.all);
router.post("/", TicketController.create);
router.put("/:id", TicketController.update);
router.delete("/:id", TicketController.destroy);

export default router;
