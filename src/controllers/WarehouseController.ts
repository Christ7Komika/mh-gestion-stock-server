import { Request, Response } from "express";
import { prisma } from "../model/prisma";

export class WarehouseController {
  static async index(req: Request, res: Response) {
    const id: string = req.params.id;
    return res
      .status(200)
      .json(await prisma.warehouse.findUnique({ where: { id } }));
  }
  static async all(req: Request, res: Response) {
    return res.status(200).json(await prisma.warehouse.findMany());
  }
  static async create({ body }: Request, res: Response) {
    const { name } = body;

    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom de le l'entrepot." });
    }

    try {
      await prisma.warehouse.create({
        data: {
          name: name,
          stat: 0,
        },
      });

      return res
        .status(200)
        .json({ message: "La requête a éte exécuté avec succès." });
    } catch (e) {
      return res.status(500).json({ message: "Requête invalide", error: e });
    }
  }

  static async update({ body, params }: Request, res: Response) {
    const id: string = params.id;
    const { name } = body;

    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom de le l'entrepot." });
    }

    try {
      await prisma.warehouse.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          stat: 0,
        },
      });

      return res
        .status(200)
        .json({ message: "La requête a éte exécuté avec succès." });
    } catch (e) {
      return res.status(500).json({ message: "Requête invalide", error: e });
    }
  }
  static async destroy({ params }: Request, res: Response) {
    const id: string = params.id;
    const name: string = params.name;
    const warehouse = await prisma.warehouse.findUnique({ where: { id } });

    try {
      if (warehouse?.name === name) {
        await prisma.warehouse.delete({ where: { id } });
        return res.status(200).json("La requête a été exécuté avec succès.");
      }
      return res
        .status(500)
        .json({ message: "Le nom insérer ne correspond pas a l'entrepot" });
    } catch (e) {
      return res.status(500).json("La requête a échoué.");
    }
  }
}
