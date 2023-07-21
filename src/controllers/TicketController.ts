import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { Article, PendingItem } from "@prisma/client";
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
    const { name, orderNumber, client, articles, sum } = body;
    let article: Article[] = [];
    let pendingItems: PendingItem[] = [];
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

        const data2 = await prisma.pendingItem.create({
          data: {
            article: {
              connect: {
                id: articles[i].id,
              },
            },
            quantity: articles[i].quantity,
          },
        });

        pendingItems = [...pendingItems, data2];

        article = [...article, data];
      }

      // Creer le ticket
      const ticket = prisma.ticket.create({
        data: {
          name: name,
          purchaseOrder: orderNumber,
          status: "En cour",
          sum: sum,
        },
      });

      // Creation des articles en attente
      // await prisma.pendingItem.create({
      //   data: {
      //     article: {
      //       connect: {
      //         id: articles[i].id,
      //       },
      //     },
      //     quantity: articles[i].quantity,
      //   }
      // })
      console.log("article -> ", article);
      res.end();
      // await prisma.ticket.create({
      //   data: {
      //     name: name,
      //     purchaseOrder: orderNumber,
      //     Client: {
      //       connect: {
      //         id: client
      //       }
      //     }
      //   }
      // })
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La création du ticket de sorti a échoué", error: e });
    }
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
