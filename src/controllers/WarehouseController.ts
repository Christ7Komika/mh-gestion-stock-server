import { Request, Response } from "express";
import { prisma } from "../model/prisma";

export class WarehouseController {
  static async index(req: Request, res: Response) {
    const id: string = req.params.id;
    return res.status(200).json(
      await prisma.warehouse.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          articles: {
            select: {
              id: true,
            },
          },
          createdAt: true,
        },
      })
    );
  }

  static async all(req: Request, res: Response) {
    return res.status(200).json(
      await prisma.warehouse.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          articles: {
            select: {
              id: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  }

  static async create({ body }: Request, res: Response) {
    const { name, description } = body;

    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom de le l'entrepot." });
    }

    try {
      await prisma.warehouse.create({
        data: {
          name: name,
          description: description,
        },
      });

      const warehouse = await prisma.warehouse.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          articles: {
            select: {
              id: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(warehouse);
    } catch (e) {
      return res.status(500).json({ message: "Requête invalide", error: e });
    }
  }

  static async update({ body, params }: Request, res: Response) {
    const id: string = params.id;
    const { name, description } = body;

    if (!name && !description) {
      return res
        .status(404)
        .json({ message: "Veuillez remplir au moins un des champs soumis." });
    }

    const data: any = {};

    if (name) {
      data.name = name;
    }

    if (description) {
      data.description = description;
    }

    try {
      await prisma.warehouse.update({
        where: {
          id: id,
        },
        data: data,
      });

      const warehouse = await prisma.warehouse.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          articles: {
            select: {
              id: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(warehouse);
    } catch (e) {
      return res.status(500).json({ message: "Requête invalide", error: e });
    }
  }

  static async destroy({ params }: Request, res: Response) {
    const id: string = params.id;
    try {
      await prisma.warehouse.delete({ where: { id } });
      const warehouses = await prisma.warehouse.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          articles: {
            select: {
              id: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json(warehouses);
    } catch (e) {
      return res.status(500).json({
        message: "La requête a échoué.",
        error: e,
      });
    }
  }
}
