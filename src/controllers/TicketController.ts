import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { Article, Item } from "@prisma/client";
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

  static async getByStatus(req: Request, res: Response) {}

  static async filterByDate(req: Request, res: Response) {}

  static async create({ body }: Request, res: Response) {
    const { name, orderNumber, client, articles, sum } = body;
    let article: Article[] = [];
    let items: Item[] = [];
    try {
      for (let i = 0; i < articles.length; i++) {
        // Modification des differents articles et recuperation de leur id
        const data = await prisma.article.update({
          where: {
            id: articles[i].id,
          },
          data: {
            quantity: articles[i].quantity - articles[i].withdraw,
          },
        });
        article = [...article, data];
      }

      for (let i = 0; i < articles.length; i++) {
        // Creation des articles modifiers
        const data = await prisma.item.create({
          data: {
            quantity: articles[i].quantity.toString(),
            article: {
              connect: {
                id: articles[i].id,
              },
            },
          },
        });
        items = [...items, data];
      }

      // Creer le ticket
      await prisma.ticket.create({
        data: {
          name: name,
          purchaseOrder: orderNumber,
          status: "En cour",
          sum: sum,
          articles: {
            connect: article.map((item) => ({ id: item.id })),
          },
          item: {
            connect: items.map((item) => ({ id: item.id })),
          },
          Client: {
            connect: {
              id: client,
            },
          },
        },
      });
      return res.status(200).json(
        await prisma.ticket.findMany({
          select: tickets,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La création du ticket de sorti a échoué", error: e });
    }
  }

  static async cancelTicket(req: Request, res: Response) {
    return res.json("Update Ticket ");
  }

  static async valideTicket(req: Request, res: Response) {
    return res.json("Update Ticket ");
  }

  static async print(req: Request, res: Response) {}

  static async destroy(req: Request, res: Response) {
    return res.json("Destroy Ticket");
  }
}
