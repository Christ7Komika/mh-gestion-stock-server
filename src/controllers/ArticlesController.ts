import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync } from "fs";
import { HistoryService } from "../services/HistoryService";
import { StoreService } from "../services/StoreServices";

interface Comment {
  commentId: {
    comment: [
      {
        id: string;
      }
    ];
  };
}

export class ArticlesController {
  static async index(req: Request, res: Response) {
    const id: string = req.params.id;

    try {
      const supplier = await prisma.article.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          image: true,
          name: true,
          code: true,
          type: true,
          designation: true,
          quantity: true,
          length: true,
          purchasePrice: true,
          sellingPrice: true,
          unitPrice: true,
          lotNumber: true,
          operatingPressure: true,
          diameter: true,
          fluid: true,
          Reference: {
            select: {
              id: true,
              name: true,
            },
          },
          Supplier: {
            select: {
              id: true,
              name: true,
            },
          },

          Warehouse: {
            select: {
              id: true,
              name: true,
            },
          },
          Category: {
            select: {
              id: true,
              name: true,
            },
          },
          Stall: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return res.status(200).json(supplier);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requête a échoué.", error: e });
    }
  }
  static async all(req: Request, res: Response) {
    return res.status(200).json(
      await prisma.article.findMany({
        select: {
          id: true,
          image: true,
          name: true,
          code: true,
          type: true,
          designation: true,
          quantity: true,
          length: true,
          purchasePrice: true,
          sellingPrice: true,
          unitPrice: true,
          lotNumber: true,
          operatingPressure: true,
          diameter: true,
          fluid: true,
          Reference: {
            select: {
              id: true,
              name: true,
            },
          },
          Supplier: {
            select: {
              id: true,
              name: true,
            },
          },

          Warehouse: {
            select: {
              id: true,
              name: true,
            },
          },
          Category: {
            select: {
              id: true,
              name: true,
            },
          },
          Stall: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
    );
  }

  static async create({ body, file }: Request, res: Response) {
    const {
      name,
      code,
      type,
      designation,
      quantity,
      length,
      purchasePrice,
      sellingPrice,
      unitPrice,
      lotNumber,
      operatingPressure,
      diameter,
      fluid,
      reference,
      supplier,
      warehouse,
      category,
      stall,
      comment,
    } = body;
    const image = file?.filename ? resolve(file?.path) : null;

    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom de l'article." });
    }
    if (!code) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le code de l'article." });
    }
    if (!designation) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer la désignation de l'article." });
    }

    if (!quantity && !length) {
      return res.status(404).json({
        message:
          "Veuillez inserer soit la quantité ou la longueur  de l'article.",
      });
    }

    if (!purchasePrice) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le prix d'achat de l'article." });
    }

    if (!sellingPrice) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le prix de vente de l'article." });
    }

    if (!unitPrice) {
      return res.status(404).json({
        message: "Veuillez inserer le prix de unitaire de l'article.",
      });
    }

    if (!lotNumber) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le numéro lot de l'article." });
    }

    try {
      const article = await prisma.article.create({
        data: {
          image: image,
          name: name,
          code: code,
          type: type,
          designation: designation,
          quantity: quantity,
          length: length,
          purchasePrice: purchasePrice,
          sellingPrice: sellingPrice,
          unitPrice: unitPrice,
          lotNumber: lotNumber,
          operatingPressure: operatingPressure,
          diameter: diameter,
          fluid: fluid,
          Comment: {
            create: {
              message: comment,
            },
          }, // To see
          referenceId: reference,
          supplierId: supplier,
          warehouseId: warehouse,
          categoryId: category,
          stallId: stall,
        },
      });

      try {
        let articleData = await prisma.article.findUnique({
          where: { id: article.id },
          select: {
            Comment: {
              orderBy: {
                creadtedAt: "desc",
              },
              take: 1,
              select: {
                id: true,
              },
            },
          },
        });

        const commentId = (comment && articleData?.Comment[0].id) as string;
        await HistoryService.create({
          state: "Création",
          type: "Article",
          message: `Création de l'article ''${article.name}''\n${
            article.quantity && "Quantité Ajouté " + article.quantity
          }\n${
            article.length && "Longeur de l'article ajouté " + article.length
          } `,
          commentId: commentId,
        });

        try {
          await StoreService.inCommingStore(article.name, article.id);
          return res.status(200).end();
        } catch (e) {
          return res.status(500).json({
            message:
              "La requête a échoué, impossible de rajouter l'article dans le stock entrant",
            error: e,
          });
        }
      } catch (e) {
        return res.status(500).json({
          message: "La requête a échoué, impossible de créer l'historique",
          error: e,
        });
      }
    } catch (e) {
      return res.status(500).json({
        message: "La requête a échoué, impossible de créer un article",
        error: e,
      });
    }
  }

  static async update({ body, file, params }: Request, res: Response) {
    const id: string = params.id;
    const {
      name,
      code,
      type,
      designation,
      purchasePrice,
      sellingPrice,
      unitPrice,
      lotNumber,
      operatingPressure,
      diameter,
      fluid,
      reference,
      supplier,
      warehouse,
      category,
      stall,
      comment,
    } = body;
    const image = file?.filename ? resolve(file?.path) : null;

    try {
      await prisma.article.update({
        where: {
          id: id,
        },
        data: {
          image: image && image,
          name: name && name,
          code: code && code,
          type: type && type,
          designation: designation && designation,
          purchasePrice: purchasePrice && purchasePrice,
          sellingPrice: sellingPrice && sellingPrice,
          unitPrice: unitPrice && unitPrice,
          lotNumber: lotNumber && lotNumber,
          operatingPressure: operatingPressure && operatingPressure,
          diameter: diameter && diameter,
          fluid: fluid && fluid,
          Comment: {
            create: {
              message: comment,
            },
          },
          referenceId: reference,
          supplierId: supplier,
          warehouseId: warehouse,
          categoryId: category,
          stallId: stall,
        },
      });

      return res.status(200).end();
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requêtte a échoué", error: e });
    }
  }

  static async getByGroup({ body, file, params }: Request, res: Response) {}

  static async getPerNumber({ body, file, params }: Request, res: Response) {}

  static async addArticle({ body, file, params }: Request, res: Response) {}

  static async removeArticle({ body, file, params }: Request, res: Response) {}
  static async moveToStore({ body, file, params }: Request, res: Response) {}

  static async destroy(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      await prisma.supplier.delete({
        where: {
          id: id,
        },
      });

      return res.status(200).end();
    } catch (e) {
      return res.status(500).json({ message: "La requête a échoué", error: e });
    }
  }
}

// Gerer les groups
//  Gerer le stock entrant
// Gerer l'enregistrement dans l'historique
