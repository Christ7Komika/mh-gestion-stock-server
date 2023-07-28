import { Router } from "express";
import { TicketController } from "../controllers/TicketController";
const router = Router();

router.get("/:id", TicketController.index);
router.get("/", TicketController.all);
router.post("/status", TicketController.getByStatus);
router.post("/ticket/filter", TicketController.filterByDate);
router.post("/", TicketController.create);
router.get("/cancel/:id", TicketController.cancelTicket);
router.get("/valid/:id", TicketController.valideTicket);
router.delete("/:id", TicketController.destroy);
router.get("/history/add", TicketController.getHistory);
router.post("/history/filter", TicketController.filterHistoryByDate);
router.post("/find", TicketController.searchTickets);

export default router;
