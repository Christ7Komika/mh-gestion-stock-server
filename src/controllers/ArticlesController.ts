import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync } from "fs";
import { HistoryService } from "../services/HistoryService";
import { StoreService } from "../services/StoreServices";

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

    let commentData = null;

    if (comment) {
      commentData = await prisma.comment.create({
        data: {
          message: comment,
        },
      });
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
          commentId: commentData?.id,
          referenceId: reference,
          supplierId: supplier,
          warehouseId: warehouse,
          categoryId: category,
          stallId: stall,
        },
      });

      try {
        await HistoryService.create({
          state: "Création",
          type: "Article",
          message: `Création de l'article ''${article.name}''\n${
            article.quantity && "Quantité Ajouté " + article.quantity
          }\n${
            article.length && "Longeur de l'article ajouté " + article.length
          } `,
          commentId: article.commentId || "",
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

    let commentData = null;

    if (comment) {
      commentData = await prisma.comment.create({
        data: {
          message: comment,
        },
      });
    }

    const articleData = await prisma.article.findUnique({ where: { id: id } });

    try {
      const { image: img } = await prisma.article.findUniqueOrThrow({
        where: { id },
      });

      if (img) {
        unlinkSync(img);
      }
      const article = await prisma.article.update({
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
          commentId: commentData?.id,
          referenceId: reference,
          supplierId: supplier,
          warehouseId: warehouse,
          categoryId: category,
          stallId: stall,
        },
      });

      try {
        await HistoryService.create({
          state: "Modification",
          type: "Article",
          message: `Modification de l'article ''${article.name}''
          \n${article.image && "L'image a été modifié"}
          \n${
            article.code &&
            `Le code a été modifié ${articleData?.code} => ${article.code}`
          }
          \n${
            article.type &&
            `Le type a été modifié ${articleData?.type} => ${article.type}`
          }
          \n${
            article.designation &&
            `La désination a été modifié ${articleData?.designation} => ${article.designation}`
          }
          \n${
            article.purchasePrice &&
            `Le prix d'achat a été modifié ${articleData?.purchasePrice} => ${article.purchasePrice}`
          }
          \n${
            article.sellingPrice &&
            `Le prix de vente a été modifié ${articleData?.sellingPrice} => ${article.sellingPrice}`
          }
          \n${
            article.unitPrice &&
            `Le prix unitaire a été modifié ${articleData?.unitPrice} => ${article.unitPrice}`
          }
          \n${
            article.lotNumber &&
            `Le numéroo lot a été modifié ${articleData?.lotNumber} => ${article.lotNumber}`
          }
          \n${
            article.operatingPressure &&
            `La pression de service a été modifié ${articleData?.operatingPressure} => ${article.operatingPressure}`
          }
          \n${
            article.diameter &&
            `Le diamètre a été modifié ${articleData?.diameter} => ${article.diameter}`
          }
          \n${
            article.fluid &&
            `Le fluide a été modifié ${articleData?.fluid} => ${article.fluid}`
          }
          \n${article.referenceId && `Le reference a été modifié `}
          \n${article.supplierId && `Le fournisseur a été modifié `}
          \n${article.warehouseId && `L'entrepot a été modifié `}
          \n${article.categoryId && `La catégorie a été modifié `}
          \n${article.stallId && `L'emplacement a été modifié `}
          `,
          commentId: commentData?.id || "",
        });
        return res.status(200).end();
      } catch (e) {
        return res.status(500).json({
          message: "La requête a échoué, impossible de créer l'historique",
          error: e,
        });
      }
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requêtte a échoué", error: e });
    }
  }

  static async getByGroup({ body, file, params }: Request, res: Response) {}

  static async addArticle({ body, file, params }: Request, res: Response) {
    const id: string = params.id;
    const { quantity, length, comment } = body;

    let commentData = null;

    if (comment) {
      commentData = await prisma.comment.create({
        data: {
          message: comment,
        },
      });
    }
    try {
      const article = await prisma.article.findUniqueOrThrow({ where: { id } });
      if (article) {
        await prisma.article.update({
          where: { id: id },
          data: {
            quantity: article.quantity + quantity,
            length: article.length + length,
          },
        });

        try {
          await HistoryService.create({
            state: "Modification",
            type: "Article",
            message: `Article ''${article.name}'' ajout ${
              quantity
                ? "de " + quantity + " article(s) a été realisé."
                : "de " + length + "mètre(s) a été réalisé."
            }
            `,
            commentId: commentData?.id || "",
          });
          return res.status(200).end();
        } catch (e) {
          return res.status(500).json({
            message: "La requête a échoué, impossible de créer l'historique",
            error: e,
          });
        }
      }
    } catch (e) {
      return res.status(500).json({
        message: "La requête a échoué.",
        error: e,
      });
    }
  }
  static async removeArticle({ body, file, params }: Request, res: Response) {
    const id: string = params.id;
    const { quantity, length, comment } = body;

    let commentData = null;

    if (comment) {
      commentData = await prisma.comment.create({
        data: {
          message: comment,
        },
      });
    }
    try {
      const article = await prisma.article.findUniqueOrThrow({ where: { id } });
      const newQty = article.quantity - quantity;
      const newLen = article.length - length;

      if (newQty < 0) {
        return res.status(500).json({
          message: "La quantité retirer est supperieur a la quantité en stock",
        });
      }

      if (newLen < 0) {
        return res.status(500).json({
          message: "La longueur retirer est supperieur a la longueur en stock",
        });
      }
      if (article) {
        await prisma.article.update({
          where: { id: id },
          data: {
            quantity: newQty,
            length: newLen,
          },
        });

        try {
          await HistoryService.create({
            state: "Modification",
            type: "Article",
            message: `Article ''${article.name}'' ajout ${
              quantity
                ? "de " + quantity + " article(s) a été realisé."
                : "de " + length + "mètre(s) a été réalisé."
            }
            `,
            commentId: commentData?.id || "",
          });
          return res.status(200).end();
        } catch (e) {
          return res.status(500).json({
            message: "La requête a échoué, impossible de créer l'historique",
            error: e,
          });
        }
      }
    } catch (e) {
      return res.status(500).json({
        message: "La requête a échoué.",
        error: e,
      });
    }
  }

  static async moveToStore({ body, file, params }: Request, res: Response) {
    const id: string = params.id;
    const { quantity, length, warehouse } = body;

    try {
      const article = await prisma.article.findUniqueOrThrow({
        where: { id: id },
      });

      await prisma.article.update({
        where: { id: id },
        data: {},
      });
    } catch (e) {
      return res.status(500).json({
        message: "La requette a échoué.",
        error: e,
      });
    }
  }

  static async destroy(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      const article = await prisma.article.findUniqueOrThrow({ where: { id } });

      if (article?.image) {
        unlinkSync(article?.image);
      }
      await prisma.article.delete({
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
