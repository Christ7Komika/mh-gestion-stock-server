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
    return res.status(200).json(
      await prisma.category.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  }

  static async create({ body }: Request, res: Response) {
    const { name, reference, description } = body;
    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom de la catégorie." });
    }

    try {
      await prisma.category.create({
        data: {
          name: name,
          reference: reference,
          description: description,
        },
      });

      const suppliers = await prisma.category.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json(suppliers);
    } catch (e) {
      return res.status(500).json({ message: "Requête invalide", error: e });
    }
  }
  static async update({ body, params }: Request, res: Response) {
    const id: string = params.id;
    const { name, reference, description } = body;
    if (!name && !reference && !description) {
      return res.status(404).json({
        message:
          "Veuillez remplir au moins Un(1) champ avant de vouloir soumettre les informations.",
      });
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return res
        .status(400)
        .json({ message: "Aucune catégorie n'a été trouvé." });
    }

    const data: any = {};

    if (name) {
      data.name = name;
    }

    if (reference) {
      data.reference = reference;
    }

    if (description) {
      data.description = description;
    }

    try {
      await prisma.category.update({
        where: {
          id: id,
        },
        data: data,
      });

      const suppliers = await prisma.category.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json(suppliers);
    } catch (e) {
      return res.status(500).json({ message: "Requête invalide", error: e });
    }
  }
  static async destroy({ params }: Request, res: Response) {
    const id: string = params.id;
    try {
      await prisma.category.delete({ where: { id } });
      const suppliers = await prisma.category.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json(suppliers);
    } catch (e) {
      return res.status(500).json("La requête a échoué.");
    }
  }
}
