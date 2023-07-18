import { Request, Response } from "express";
import { prisma } from "../model/prisma";
const tickets = {
  id: true,
  name: true,
  purchaseOrder: true,
  status: true,
  articles: true,
  OutGoingStore: true,
  outGoingStoreId: true,
  Client: true,
  clientId: true,
  updatedAt: true,
  createdAt: true,
};

export class TicketController {
  static async index(req: Request, res: Response) {
    return res.status(200).json(
      await prisma.ticket.findUnique({
        where: {
          id: req.params.id,
        },
        select: tickets,
      })
    );
  }
  static async all(req: Request, res: Response) {
    return res.status(200).json(
      await prisma.ticket.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  }
  static async create({ body }: Request, res: Response) {
    const { name } = body;
  }

  static async update(req: Request, res: Response) {
    return res.json("Update Ticket ");
  }

  static async changeStatus(req: Request, res: Response) {
    return res.json("Update Ticket ");
  }
  static async destroy(req: Request, res: Response) {
    return res.json("Destroy Ticket");
  }
}
