import { Request, Response } from "express";

export class TicketController {
  static async index(req: Request, res: Response) {
    return res.json("Get Ticket");
  }
  static async all(req: Request, res: Response) {
    return res.json("Get Tickets");
  }
  static async create(req: Request, res: Response) {
    return res.json("Create Ticket ");
  }
  static async update(req: Request, res: Response) {
    return res.json("Update Ticket ");
  }
  static async destroy(req: Request, res: Response) {
    return res.json("Destroy Ticket");
  }
}
