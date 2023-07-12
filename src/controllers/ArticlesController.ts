import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";
import { HistoryService } from "../services/HistoryService";
import { InCommingStore, StoreService } from "../services/StoreServices";
import { Prisma } from "@prisma/client";

const articles = {
  id: true,
  image: true,
  name: true,
  code: true,
  type: true,
  designation: true,
  quantity: true,
  hasLength: true,
  purchasePrice: true,
  sellingPrice: true,
  unitPrice: true,
  lotNumber: true,
  operatingPressure: true,
  diameter: true,
  fluid: true,
  reference: true,
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
  createdAt: true,
};

export class ArticlesController {
  static async index(req: Request, res: Response) {
    const id: string = req.params.id;

    try {
      const supplier = await prisma.article.findUnique({
        where: {
          id: id,
        },
        select: articles,
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
        select: articles,
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
      hasLength,
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
      comment,
    } = body;

    const image = file?.filename ? resolve(file?.path) : null;
    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom de l'article." });
    }
    if (!quantity) {
      return res.status(404).json({
        message:
          "Veuillez inserer soit le nombre d'article ou la longeur de l' article  que vous voulez ajouter ou les deux.",
      });
    }

    const isValidSupplier = await prisma.supplier.findUnique({
      where: { id: supplier },
    });
    const isValidCategory = await prisma.category.findUnique({
      where: { id: category },
    });
    const isValidWarehouse = await prisma.warehouse.findUnique({
      where: { id: warehouse },
    });

    if (!isValidSupplier || !isValidCategory || !isValidWarehouse) {
      throw new Error("Fournisseur, catégorie ou entrepôt invalide !");
    }

    try {
      const article = await prisma.article.create({
        data: {
          image: image,
          name: name,
          code: code,
          type: type,
          designation: designation,
          quantity: parseFloat(quantity),
          hasLength: hasLength === "true" ? true : false,
          purchasePrice: purchasePrice,
          sellingPrice: sellingPrice,
          unitPrice: unitPrice,
          lotNumber: lotNumber,
          operatingPressure: operatingPressure,
          diameter: diameter,
          fluid: fluid,
          reference: reference,
          Comment: {
            create: {
              message: comment || "Nouveau(x) article(s) ajouté(s)",
            },
          },
          Warehouse: {
            connect: {
              id: isValidWarehouse.id,
            },
          },
          Category: {
            connect: {
              id: isValidCategory.id,
            },
          },
          Supplier: {
            connect: {
              id: isValidSupplier.id,
            },
          },
        } as Prisma.ArticleUncheckedCreateInput,
        include: {
          Comment: true,
        },
      });

      try {
        await HistoryService.create({
          state: "Création",
          type: "Article",
          message: `Création de l'article ''${article.name}''
          ${quantity ? "Quantité Ajouté " + quantity : ""}`,
          commentId: article.commentId || "",
        });

        const inComingStore: InCommingStore = {
          articleId: article.id,
          articleName: article.name,
          quantity: article.quantity,
          designation: article.designation,
          hasLength: article.hasLength as boolean,
          messageId: article.commentId as string,
        };

        try {
          await StoreService.inComingStore(inComingStore);
          return res
            .status(200)
            .json(await prisma.article.findMany({ select: articles }));
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
      category,
      comment,
    } = body;
    const image = file?.filename ? resolve(file?.path) : null;

    let supplierData = null;
    let categoryData = null;

    if (supplier) {
      supplierData = await prisma.supplier.findUnique({
        where: { id: supplier },
      });
      if (!supplierData) {
        return res
          .status(400)
          .json({ message: "L'identifiant du fournisseur est invalide" });
      }
    }

    if (category) {
      categoryData = await prisma.category.findUnique({
        where: { id: category },
      });
      if (!supplierData) {
        return res
          .status(400)
          .json({ message: "L'identifiant de la catégorie est invalide" });
      }
    }

    const articleData = await prisma.article.findUnique({ where: { id: id } });
    const commentData = await prisma.comment.create({
      data: {
        message:
          comment ||
          `Modification ajouté sur l'article '${articleData?.name}' réalisé.`,
      },
    });

    try {
      const { image: img } = await prisma.article.findUniqueOrThrow({
        where: { id },
      });

      console.log("image : ", img);

      if (img && existsSync(img)) {
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
          reference: reference && reference,
          Comment: {
            create: {
              message: comment || "Nouveau(x) article(s) ajouté(s)",
            },
          },
          supplierId: supplier && supplier,
          categoryId: category && category,
        },
      });
      try {
        await HistoryService.create({
          state: "Modification",
          type: "Article",
          message: `
          Modification de l'article ''${article.name}''
          ${article.image && "L'image a été modifié"}
          ${
            article.code
              ? `Le code a été modifié ${articleData?.code} => ${article.code}`
              : ""
          }
          ${
            article.type
              ? `Le type a été modifié ${articleData?.type} => ${article.type}`
              : ""
          }
          ${
            article.designation
              ? `La désination a été modifié ${articleData?.designation} => ${article.designation}`
              : ""
          }
          ${
            article.purchasePrice
              ? `Le prix d'achat a été modifié ${articleData?.purchasePrice} => ${article.purchasePrice}`
              : ""
          }
          ${
            article.sellingPrice
              ? `Le prix de vente a été modifié ${articleData?.sellingPrice} => ${article.sellingPrice}`
              : ""
          }
          ${
            article.unitPrice
              ? `Le prix unitaire a été modifié ${articleData?.unitPrice} => ${article.unitPrice}`
              : ""
          }
          ${
            article.lotNumber
              ? `Le numéro lot a été modifié ${articleData?.lotNumber} => ${article.lotNumber}`
              : ""
          }
          ${
            article.operatingPressure
              ? `La pression de service a été modifié ${articleData?.operatingPressure} => ${article.operatingPressure}`
              : ""
          }
          ${
            article.diameter
              ? `Le diamètre a été modifié ${articleData?.diameter} => ${article.diameter}`
              : ""
          }
          ${
            article.fluid
              ? `Le fluide a été modifié ${articleData?.fluid} => ${article.fluid}`
              : ""
          }
          ${article.supplierId ? `Le fournisseur a été modifié ` : ""}
          ${article.categoryId ? `La catégorie a été modifié ` : ""}
          `,
          commentId: commentData?.id || "",
        });
        return res
          .status(200)
          .json(await prisma.article.findMany({ select: articles }));
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

  static async addArticle({ body, params }: Request, res: Response) {
    const id: string = params.id;
    const { quantity, comment } = body;

    try {
      const commentData = await prisma.comment.create({
        data: {
          message: comment || "Ajout d'un ou plusieur article(s)",
        },
      });

      const articleData = await prisma.article.findUniqueOrThrow({
        where: { id },
      });

      if (articleData) {
        try {
          const article = await prisma.article.update({
            where: {
              id: articleData.id,
            },
            data: {
              quantity: articleData.quantity + parseFloat(quantity),
              Comment: {
                connect: {
                  id: commentData.id,
                },
              },
            },
          });

          try {
            await HistoryService.create({
              state: "Ajout",
              type: "Article",
              message: `Article ''${article.name}'' : ${
                article.hasLength
                  ? `ajout de ${article.quantity} mètre(s) réalisé`
                  : `ajout de ${article.quantity} ${article.name} a été réalisé.`
              }`,
              commentId: commentData?.id || "",
            });
            const inComingStore: InCommingStore = {
              articleId: article.id,
              articleName: article.name,
              quantity: quantity,
              designation: article.designation,
              hasLength: article.hasLength as boolean,
              messageId: commentData.id,
            };

            try {
              await StoreService.inComingStore(inComingStore);
              return res
                .status(200)
                .json(await prisma.article.findMany({ select: articles }));
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
    } catch (e) {
      return res.status(500).json({
        message: "La requête a échoué.",
        error: e,
      });
    }
  }

  static async removeArticle({ body, params }: Request, res: Response) {
    const id: string = params.id;
    const { currentQuantity, quantity, comment } = body;

    try {
      const commentData = await prisma.comment.create({
        data: {
          message: comment || "Retrait d'un ou plusieur article(s)",
        },
      });

      const articleData = await prisma.article.findUniqueOrThrow({
        where: { id },
      });

      if (articleData) {
        try {
          const article = await prisma.article.update({
            where: {
              id: articleData.id,
            },
            data: {
              quantity: parseFloat(quantity),
              Comment: {
                connect: {
                  id: commentData.id,
                },
              },
            },
          });

          try {
            await HistoryService.create({
              state: "Retrait",
              type: "Article",
              message: `Article ''${article.name}'' : ${
                article.hasLength
                  ? `retrait de ${currentQuantity} mètre(s) réalisé`
                  : `retrait de ${currentQuantity} ${article.name} a été réalisé.`
              }`,
              commentId: commentData?.id || "",
            });
            const inComingStore: InCommingStore = {
              articleId: article.id,
              articleName: article.name,
              quantity: currentQuantity,
              designation: article.designation,
              hasLength: article.hasLength as boolean,
              messageId: commentData.id,
            };

            try {
              await StoreService.inComingStore(inComingStore);

              return res
                .status(200)
                .json(await prisma.article.findMany({ select: articles }));
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
      return res
        .status(200)
        .json(await prisma.article.findMany({ select: articles }));
    } catch (e) {
      return res.status(500).json({ message: "La requête a échoué", error: e });
    }
  }
}

// Gerer les groups
//  Gerer le stock entrant
// Gerer l'enregistrement dans l'historique
