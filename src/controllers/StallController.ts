import { Request, Response } from "express";
import { prisma } from "../model/prisma";

export class StallController {
  static async index(req: Request, res: Response) {
    const id: string = req.params.id;
    return res
      .status(200)
      .json(await prisma.stall.findUnique({ where: { id } }));
  }
  static async all(req: Request, res: Response) {
    return res.status(200).json(await prisma.stall.findMany());
  }
  static async create({ body }: Request, res: Response) {
    const { name, code } = body;

    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom de le l'emplacement." });
    }

    try {
      await prisma.stall.create({
        data: {
          name: name,
          code: code,
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
    const { name, code } = body;

    if (!name && !code) {
      return res.status(404).json({
        message:
          "Veuillez inserer un nom ou un code pour réaliser la modification.",
      });
    }

    try {
      await prisma.stall.update({
        where: {
          id: id,
        },
        data: {
          name: name && name,
          code: code && code,
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
    const stall = await prisma.stall.findUnique({ where: { id } });

    try {
      if (stall?.name === name) {
        await prisma.stall.delete({ where: { id } });
        return res.status(200).json("La requête a été exécuté avec succès.");
      }
      return res
        .status(500)
        .json({ message: "Le nom insérer ne correspond pas a l'emplacement" });
    } catch (e) {
      return res.status(500).json("La requête a échoué.");
    }
  }
}
