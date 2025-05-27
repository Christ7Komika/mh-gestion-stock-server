import { Router } from "express";
import { TicketController } from "../controllers/TicketController";
const router = Router();

router.get("/:id", TicketController.index);
router.get("/", TicketController.all);
router.post("/status", TicketController.getByStatus);
router.post("/", TicketController.create);
router.get("/cancel/:id", TicketController.cancelTicket);
router.get("/valid/:id", TicketController.valideTicket);
router.delete("/:id", TicketController.destroy);
router.post("/find", TicketController.searchTickets);

export default router;
