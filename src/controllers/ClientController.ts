import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync } from "fs";
import { HistoryService } from "../services/HistoryService";

export class ClientController {
  static async index(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      const client = await prisma.client.findUnique({
        where: { id: id },
      });
      return res.status(200).json(client);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requête a échoué.", error: e });
    }
  }

  static async all(req: Request, res: Response) {
    return res.status(200).json(
      await prisma.client.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  }

  static async create({ body, file }: Request, res: Response) {
    const { name, company, phone, email } = body;
    const logo = file?.filename ? resolve(file?.path) : null;

    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom du client" });
    }

    try {
      const client = await prisma.client.create({
        data: {
          logo: logo,
          name: name,
          company: company,
          phone: phone,
          email: email,
        },
      });

      await HistoryService.create({
        state: "Ajout",
        type: "Client",
        message: `
        Un nouveau client vient d'être ajouté
        Nom : ${client.name}
        Société : ${client.company}.
        `,
        commentId: null,
      });

      const clients = await prisma.client.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json(clients);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requêtte a échoué", error: e });
    }
  }

  static async update({ body, file, params }: Request, res: Response) {
    const id: string = params.id;
    const { name, company, phone, email } = body;
    const logo = file?.filename ? resolve(file?.path) : null;
    const data: any = {};
    try {
      let clientData = null;
      clientData = await prisma.client.findUnique({ where: { id: id } });
      if (logo) {
        if (clientData && clientData.logo) {
          unlinkSync(clientData?.logo);
        }
        data.logo = logo;
      }

      if (name) {
        data.name = name;
      }

      if (company) {
        data.company = company;
      }

      if (phone) {
        data.phone = phone;
      }

      if (email) {
        data.email = email;
      }
      const client = await prisma.client.update({
        where: { id: id },
        data: data,
      });

      await HistoryService.create({
        state: "Modification",
        type: "Client",
        message: `
        Les informations du client ${client?.name}:${
          clientData?.company
        } viennent d'être modifié.\n
        ${logo && "Le logo vient d'être modifié\n"}
        ${name && `An: ${clientData?.name} => Nn: ${client.name}\n\n`}
        ${company && `Ana: ${clientData?.company} => Nna:${client.company}\n`}
        ${email && `Ae: ${clientData?.email} => Ne: ${client.email}\n`}
        ${phone && `Ap: ${clientData?.phone} => Np: ${client.phone}\n`}.
        `,
        commentId: null,
      });

      const clients = await prisma.client.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json(clients);
    } catch (e) {
      console.log(e);
      return res

        .status(500)
        .json({ message: "La requêtte a échoué", error: e });
    }
  }

  static async destroy(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      const client = await prisma.client.findUnique({ where: { id: id } });
      if (client && client.logo) {
        unlinkSync(client?.logo);
      }
      await prisma.client.delete({
        where: {
          id: id,
        },
      });

      await HistoryService.create({
        state: "Suppression",
        type: "Client",
        message: `
        Les informations du client ${client?.name}:${client?.company} viennent d'être retiré.
        `,
        commentId: null,
      });
      const clients = await prisma.client.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json(clients);
    } catch (e) {
      return res.status(500).json({ message: "La requête a échoué", error: e });
    }
  }

  static async getHistory(req: Request, res: Response) {
    res.status(200).json(
      await prisma.history.findMany({
        where: {
          type: "Client",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          state: true,
          type: true,
          message: true,
          createdAt: true,
        },
      })
    );
  }

  static async filterHistoryByDate({ body }: Request, res: Response) {
    const { startDate, endDate } = body;
    if (!startDate && !endDate) {
      return res
        .status(400)
        .json({ message: "Une date doit au moins être envoyé." });
    }
    if (startDate && !endDate) {
      return res.status(200).json(
        await prisma.history.findMany({
          where: {
            createdAt: {
              gte: new Date(
                new Date(startDate).getFullYear(),
                new Date(startDate).getMonth(),
                new Date(startDate).getDate()
              ),
              lt: new Date(
                new Date(startDate).getFullYear(),
                new Date(startDate).getMonth(),
                new Date(startDate).getDate() + 1
              ),
            },
            AND: {
              type: "Client",
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            state: true,
            type: true,
            message: true,
            createdAt: true,
          },
        })
      );
    }
    if (startDate && endDate) {
      return res.status(200).json(
        await prisma.history.findMany({
          where: {
            type: "Client",
            AND: {
              createdAt: {
                gte: new Date(
                  new Date(startDate).getFullYear(),
                  new Date(startDate).getMonth(),
                  new Date(startDate).getDate()
                ),
                lte: new Date(
                  new Date(endDate).getFullYear(),
                  new Date(endDate).getMonth(),
                  new Date(endDate).getDate() + 1
                ),
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    }
  }

  static async searchClient(req: Request, res: Response) {
    const { search } = req.body;

    return res.status(200).json(
      await prisma.client.findMany({
        where: {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              company: {
                contains: search,
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  }
}
