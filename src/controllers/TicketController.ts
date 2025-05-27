import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { Article, Item } from "@prisma/client";

const tickets = {
  id: true,
  name: true,
  purchaseOrder: true,
  status: true,
  articles: true,
  sum: true,
  OutGoingStore: true,
  outGoingStoreId: true,
  applicant: true,
  discount: true,
  item: {
    select: {
      sumValue: true,
      quantity: true,
      hasLength: true,
      withdraw: true,
      article: {
        select: {
          hasLength: true,
          unitPrice: true,
          designation: true,
          _count: true,
        },
      },
    },
  },
  Client: {
    select: {
      id: true,
      name: true,
    },
  },
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
        select: tickets,
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  }

  static async getByStatus({ body }: Request, res: Response) {
    const { status } = body;

    if (status === "all") {
      return res.status(200).json(
        await prisma.ticket.findMany({
          select: tickets,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } else {
      return res.status(200).json(
        await prisma.ticket.findMany({
          where: { status: status },
          select: tickets,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    }
  }


  static async create({ body }: Request, res: Response) {
    const { name, orderNumber, client, articles, sum, applicant, discount } =
      body;
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
        const sum =
          parseFloat(articles[i].unitPrice.replace(" ", "")) *
          articles[i].withdraw;
        const data = await prisma.item.create({
          data: {
            sumValue: sum.toString(),
            hasLength: articles[i].hasLength,
            withdraw: articles[i].withdraw.toString(),
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
      const ticket = await prisma.ticket.create({
        data: {
          name: name,
          purchaseOrder: orderNumber,
          status: "En cour",
          sum: sum,
          applicant: applicant,
          discount: discount,
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
    const id = req.params.id;

    try {
      const ticket = await prisma.ticket.findUnique({
        where: { id: id },
        include: { articles: true, item: true },
      });

      if (ticket?.articles) {
        const articles = ticket.articles;
        for (let i = 0; i < articles.length; i++) {
          await prisma.article.update({
            where: {
              id: articles[i].id,
            },
            data: {
              quantity: {
                increment: parseFloat(ticket.item[i].withdraw),
              },
            },
          });
        }
      }

      const ticketRes = await prisma.ticket.update({
        where: {
          id: id,
        },
        data: {
          status: "Annuler",
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
      return res.status(500).json({ message: "La requete a echoué" });
    }
  }

  static async valideTicket(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const ticket = await prisma.ticket.update({
        where: { id: id },
        data: {
          status: "Valider",
        },
      });

      await prisma.outGoingStore.create({
        data: {
          tickets: {
            connect: {
              id: ticket.id,
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
      return res.status(500).json({ message: "La requete a echoué", error: e });
    }
  }

  static async destroy(req: Request, res: Response) {
    const id = req.params.id;

    try {
      await prisma.ticket.delete({
        where: { id: id },
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
      return res.status(500).json({
        message: "La requete a échoué",
        error: e,
      });
    }
  }
  static async searchTickets(req: Request, res: Response) {
    const { search } = req.body;

    return res.status(200).json(
      await prisma.ticket.findMany({
        where: {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              purchaseOrder: {
                contains: search,
              },
            },
            {
              Client: {
                name: {
                  contains: search,
                },
              },
            },
          ],
        },
        select: tickets,
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  }
}
