import { Request, Response } from "express";
import { prisma } from "../model/prisma";

export class CategoryController {
  static async index(req: Request, res: Response) {
    const id: string = req.params.id;
    return res
      .status(200)
      .json(await prisma.category.findUnique({ where: { id } }));
  }
  static async all(req: Request, res: Response) {
    return res.status(200).json(await prisma.category.findMany());
  }
  static async create({ body }: Request, res: Response) {
    const { name } = body;
    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom de la catégorie." });
    }

    try {
      await prisma.category.create({
        data: {
          name: name,
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
        .json({ message: "Veuillez inserer le nom de la catégorie." });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res
        .status(400)
        .json({ message: "Aucune catégorie n'a été trouvé." });
    }

    try {
      await prisma.category.update({
        where: {
          id: id,
        },
        data: {
          name: name,
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
    try {
      await prisma.category.delete({ where: { id } });
      return res.status(200).json("La requête a été exécuté avec succès.");
    } catch (e) {
      return res.status(500).json("La requête a échoué.");
    }
  }
}
