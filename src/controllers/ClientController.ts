import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync } from "fs";

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
    return res.status(200).json(await prisma.client.findMany());
  }

  static async create({ body, file }: Request, res: Response) {
    const { name, company, phone, email } = body;
    const logo = file?.filename ? resolve(file?.path) : null;

    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom du client" });
    }

    if (email) {
      const client = await prisma.client.findUnique({
        where: { email: email },
      });
      if (client) {
        return res
          .status(400)
          .json({ message: "Adresse mail déjà utilisé par un client " });
      }
    }

    if (phone) {
      const client = await prisma.client.findUnique({
        where: { phone: phone },
      });
      if (client) {
        return res
          .status(400)
          .json({ message: "Numéro de téléphone déjà utilisé par un client " });
      }
    }

    try {
      await prisma.client.create({
        data: {
          logo: logo,
          name: name,
          company: company,
          phone: phone,
          email: email,
        },
      });

      const clients = await prisma.client.findMany();
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

    if (logo) {
      const client = await prisma.client.findUnique({ where: { id: id } });
      if (client && client.logo) {
        unlinkSync(client?.logo);
      }
    }

    try {
      await prisma.client.update({
        where: { id: id },
        data: {
          logo: logo && logo,
          name: name && name,
          company: company && company,
          phone: phone && phone,
          email: email && email,
        },
      });

      const clients = await prisma.client.findMany();
      return res.status(200).json(clients);
    } catch (e) {
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

      const clients = await prisma.client.findMany();
      return res.status(200).json(clients);
    } catch (e) {
      return res.status(500).json({ message: "La requête a échoué", error: e });
    }
  }
}
