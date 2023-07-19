import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";
import { HistoryService } from "../services/HistoryService";
import { InCommingStore, StoreService } from "../services/StoreServices";
import { Prisma } from "@prisma/client";

type dataType =
  | "name"
  | "code"
  | "type"
  | "designation"
  | "lotNumber"
  | "operatingPressure"
  | "diameter"
  | "fluid"
  | "reference"
  | "supplierId"
  | "warehouseId"
  | "categoryId";

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

  static async all(_: Request, res: Response) {
    return res.status(200).json(
      await prisma.article.findMany({
        select: articles,
        orderBy: {
          createdAt: "desc",
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
      const commentData = await prisma.comment.create({
        data: {
          message: comment || "Nouveau(x) article(s) ajouté(s)",
        },
      });
      const article = await prisma.article.create({
        data: {
          image: image,
          name: name,
          code: code || "Aucun",
          type: type || "Aucun",
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
          reference: reference || "Aucun",
          Comment: {
            connect: {
              id: commentData.id,
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
          commentId: commentData.id || "",
        });

        const inComingStore: InCommingStore = {
          articleId: article.id,
          articleName: article.name,
          quantity: article.quantity,
          designation: article.designation,
          hasLength: article.hasLength as boolean,
          messageId: commentData.id as string,
        };

        try {
          await StoreService.inComingStore(inComingStore);
          return res.status(200).json(
            await prisma.article.findMany({
              select: articles,
              orderBy: {
                createdAt: "desc",
              },
            })
          );
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
      comment,
    } = body;
    const image = file?.filename ? resolve(file?.path) : null;

    const data: any = {};

    const articleData = await prisma.article.findUnique({ where: { id: id } });

    try {
      const { image: img } = await prisma.article.findUniqueOrThrow({
        where: { id },
      });

      if (image && img && existsSync(img)) {
        unlinkSync(img);
      }

      if (image) {
        data.image = image;
      }
      if (name) {
        data.name = name;
      }
      if (code) {
        data.code = code;
      }
      if (type) {
        data.type = type;
      }
      if (designation) {
        data.designation = designation;
      }
      if (purchasePrice) {
        data.purchasePrice = purchasePrice;
      }

      if (sellingPrice) {
        data.sellingPrice = sellingPrice;
      }

      if (unitPrice) {
        data.unitPrice = unitPrice;
      }
      if (lotNumber) {
        data.lotNumber = lotNumber;
      }
      if (operatingPressure) {
        data.operatingPressure = operatingPressure;
      }

      if (diameter) {
        data.diameter = diameter;
      }

      if (fluid) {
        data.fluid = fluid;
      }
      if (reference) {
        data.reference = reference;
      }

      const article = await prisma.article.update({
        where: {
          id: id,
        },
        data: data,
      });

      const commentData = await prisma.comment.create({
        data: {
          message:
            comment ||
            `Modification ajouté sur l'article '${articleData?.name}' réalisé.`,
          Article: {
            connect: {
              id: article.id,
            },
          },
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
          `,
          commentId: commentData?.id || "",
        });
        return res.status(200).json(
          await prisma.article.findMany({
            select: articles,
            orderBy: {
              createdAt: "desc",
            },
          })
        );
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
              return res.status(200).json(
                await prisma.article.findMany({
                  select: articles,
                  orderBy: {
                    createdAt: "desc",
                  },
                })
              );
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

            try {
              return res.status(200).json(
                await prisma.article.findMany({
                  select: articles,
                  orderBy: {
                    createdAt: "desc",
                  },
                })
              );
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

  static async changeStorage({ body, params }: Request, res: Response) {
    const id: string = params.id;
    const { warehouse, comment } = body;

    try {
      const article = await prisma.article.findUniqueOrThrow({
        where: { id: id },
      });

      const articleData = await prisma.article.update({
        where: { id: id },
        data: {
          warehouseId: warehouse,
        },
        include: {
          Warehouse: {
            select: {
              name: true,
            },
          },
        },
      });
      const commentData = await prisma.comment.create({
        data: {
          message:
            comment ||
            `Changement de stockage de l'article ${article.name}.
          ${warehouse} a été changé en ${articleData.Warehouse?.name}
          `,
        },
      });
      await HistoryService.create({
        state: "Modification",
        type: "Article",
        message: `Article ''${article.name}'' :
        La zone de stockage ${warehouse} a été changé en ${articleData.Warehouse?.name}
        `,
        commentId: commentData?.id || "",
      });

      return res.status(200).json(
        await prisma.article.findMany({
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } catch (e) {
      return res.status(500).json({
        message: "La requette a échoué.",
        error: e,
      });
    }
  }

  static async moveToStorage({ body, params }: Request, res: Response) {
    const id: string = params.id;
    const { warehouse, quantity, currentQuantity, hasLength, comment } = body;

    try {
      const article = await prisma.article.findUniqueOrThrow({
        where: { id: id },
        select: articles,
      });

      const warehouseData = await prisma.warehouse.findUniqueOrThrow({
        where: { id: warehouse },
      });

      await prisma.article.update({
        where: { id: id },
        data: {
          quantity: parseFloat(currentQuantity),
        },
      });

      const commentData = await prisma.comment.create({
        data: {
          message:
            comment ||
            `Deplacement de  ${
              hasLength === "true"
                ? `${quantity} mètre(s) de l'article vers le stockage : ${warehouseData.name}.`
                : `${quantity} article(s) vers le stockage : ${warehouseData.name}`
            }.
          `,
        },
      });

      await prisma.article.create({
        data: {
          image: article.image || "",
          name: article.name,
          code: article.code,
          type: article.type,
          designation: article.designation,
          quantity: parseFloat(quantity),
          hasLength: hasLength === "true" ? true : false,
          purchasePrice: article.purchasePrice,
          sellingPrice: article.sellingPrice,
          unitPrice: article.unitPrice,
          lotNumber: article.lotNumber,
          operatingPressure: article.operatingPressure,
          diameter: article.diameter,
          fluid: article.fluid,
          reference: article.reference,
          Comment: {
            connect: {
              id: commentData.id,
            },
          },
          Warehouse: {
            connect: {
              id: warehouse,
            },
          },
          Category: {
            connect: {
              id: article.Category?.id,
            },
          },
          Supplier: {
            connect: {
              id: article.Supplier?.id,
            },
          },
        } as Prisma.ArticleUncheckedCreateInput,
        include: {
          Comment: true,
        },
      });

      await HistoryService.create({
        state: "Modification",
        type: "Article",
        message: `Article ''${article.name}'' :
        Déplacement d'une quantité de cet article vers un autre stockage
        `,
        commentId: commentData?.id || "",
      });

      return res.status(200).json(
        await prisma.article.findMany({
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } catch (e) {
      return res.status(500).json({
        message: "La requette a échoué.",
        error: e,
      });
    }
  }

  static async changeSupplier({ body, params }: Request, res: Response) {
    const id: string = params.id;
    const { supplier, comment } = body;

    try {
      const article = await prisma.article.findUniqueOrThrow({
        where: { id: id },
      });

      const articleData = await prisma.article.update({
        where: { id: id },
        data: {
          supplierId: supplier,
        },
        include: {
          Supplier: {
            select: {
              name: true,
            },
          },
        },
      });
      const commentData = await prisma.comment.create({
        data: {
          message:
            comment ||
            `Changement du fournisseur de l'article ${article.name}.
          ${supplier} a été changé en ${articleData.Supplier?.name}
          `,
        },
      });
      await HistoryService.create({
        state: "Modification",
        type: "Article",
        message: `Article ''${article.name}'' :
        Le fournisseur ${supplier} a été changé en ${articleData.Supplier?.name}
        `,
        commentId: commentData?.id || "",
      });

      return res.status(200).json(
        await prisma.article.findMany({
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } catch (e) {
      return res.status(500).json({
        message: "La requette a échoué.",
        error: e,
      });
    }
  }

  static async changeCategorie({ body, params }: Request, res: Response) {
    const id: string = params.id;
    const { category, comment } = body;

    try {
      const article = await prisma.article.findUniqueOrThrow({
        where: { id: id },
      });

      const articleData = await prisma.article.update({
        where: { id: id },
        data: {
          categoryId: category,
        },
        include: {
          Category: {
            select: {
              name: true,
            },
          },
        },
      });
      const commentData = await prisma.comment.create({
        data: {
          message:
            comment ||
            `Changement de la catégorie de l'article ${article.name}.
          ${category} a été changé en ${articleData.Category?.name}
          `,
        },
      });
      await HistoryService.create({
        state: "Modification",
        type: "Article",
        message: `Article ''${article.name}'' :
        La catégorie ${category} a été changé en ${articleData.Category?.name}
        `,
        commentId: commentData?.id || "",
      });

      return res.status(200).json(
        await prisma.article.findMany({
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
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
      if (article?.image && existsSync(article.image)) {
        unlinkSync(article?.image);
      }
      await prisma.article.delete({
        where: {
          id: id,
        },
      });
      return res.status(200).json(
        await prisma.article.findMany({
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } catch (e) {
      return res.status(500).json({ message: "La requête a échoué", error: e });
    }
  }

  static async getHistory(_: Request, res: Response) {
    res.status(200).json(
      await prisma.history.findMany({
        where: {
          type: "Article",
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
          comment: {
            select: {
              message: true,
            },
          },
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
              type: "Article",
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
            type: "Article",
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
        })
      );
    }
  }

  static async filter({ body }: Request, res: Response) {
    const { warehouse, supplier, category, search } = body;
    try {
      const where: Prisma.ArticleWhereInput = {};

      if (search) {
        where.OR = [
          { name: { contains: search } },
          { code: { contains: search } },
          { type: { contains: search } },
          { designation: { contains: search } },
          { reference: { contains: search } },
          { lotNumber: { contains: search } },
          { diameter: { contains: search } },
          { fluid: { contains: search } },
        ];
      }

      // Filtrer par warehouseId s'il est fourni
      if (warehouse) {
        where.warehouseId = warehouse;
      }

      // Filtrer par categoryId s'il est fourni
      if (category) {
        where.categoryId = category;
      }

      // Filtrer par supplierId s'il est fourni
      if (supplier) {
        where.supplierId = supplier;
      }

      const articles = await prisma.article.findMany({
        where,
        include: {
          Supplier: true,
          Warehouse: true,
          Category: true,
          Comment: true,
          Ticket: true,
        },
      });

      return res.status(200).json(articles);
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        message: "Erreur lors de la filtration des articles",
        error: error,
      });
    }
  }

  static async getByGroup({ body }: Request, res: Response) {
    const { group, search } = body;
    const groupBy: dataType = group || "name";

    if (groupBy === "categoryId") {
      const articlesGroupedByCategory = await prisma.article.groupBy({
        by: ["categoryId"],
        _count: true,
      });

      if (search) {
        const result = await Promise.all(
          articlesGroupedByCategory.map(async (group) => {
            const categoryId = group.categoryId;
            const category = await prisma.category.findUnique({
              where: {
                id: categoryId as string,
                name: {
                  contains: search,
                },
              },
            });
            return { category, count: group._count };
          })
        );
        return res.status(200).json(result);
      } else {
        const result = await Promise.all(
          articlesGroupedByCategory.map(async (group) => {
            const categoryId = group.categoryId;
            const category = await prisma.category.findUnique({
              where: { id: categoryId as string },
            });
            return { category, count: group._count };
          })
        );
        return res.status(200).json(result);
      }
    } else if (groupBy === "supplierId") {
      const articlesGroupedBySupplier = await prisma.article.groupBy({
        by: ["supplierId"],
        _count: true,
      });

      if (search) {
        const result = await Promise.all(
          articlesGroupedBySupplier.map(async (group) => {
            const supplierId = group.supplierId;
            const supplier = await prisma.supplier.findUnique({
              where: {
                id: supplierId as string,
                AND: {
                  name: {
                    contains: search,
                  },
                },
              },
            });
            return { supplier, count: group._count };
          })
        );
        return res.status(200).json(result);
      } else {
        const result = await Promise.all(
          articlesGroupedBySupplier.map(async (group) => {
            const supplierId = group.supplierId;
            const supplier = await prisma.supplier.findUnique({
              where: { id: supplierId as string },
            });
            return { supplier, count: group._count };
          })
        );
        return res.status(200).json(result);
      }
    } else if (groupBy === "warehouseId") {
      const articlesGroupedByWarehouse = await prisma.article.groupBy({
        by: ["warehouseId"],
        _count: true,
      });
      if (search) {
        const result = await Promise.all(
          articlesGroupedByWarehouse.map(async (group) => {
            const warehouseId = group.warehouseId;
            const warehouse = await prisma.warehouse.findUnique({
              where: {
                id: warehouseId as string,
                AND: {
                  name: {
                    contains: search,
                  },
                },
              },
            });
            return { warehouse, count: group._count };
          })
        );
        return res.status(200).json(result);
      } else {
        const result = await Promise.all(
          articlesGroupedByWarehouse.map(async (group) => {
            const warehouseId = group.warehouseId;
            const warehouse = await prisma.warehouse.findUnique({
              where: { id: warehouseId as string },
            });
            return { warehouse, count: group._count };
          })
        );
        return res.status(200).json(result);
      }
    } else {
      if (search) {
        return res.status(200).json(
          await prisma.article.groupBy({
            by: [groupBy],
            _count: true,
            where: {
              [groupBy]: {
                contains: search,
              },
            },
          })
        );
      } else {
        return res.status(200).json(
          await prisma.article.groupBy({
            by: [groupBy],
            _count: true,
          })
        );
      }
    }
  }

  static async getArticlesByName({ body }: Request, res: Response) {
    const { type, value } = body;

    if (type === "supplier") {
      return res.status(200).json(
        await prisma.article.findMany({
          where: {
            Supplier: {
              name: {
                contains: value,
              },
            },
          },
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } else if (type === "category") {
      return res.status(200).json(
        await prisma.article.findMany({
          where: {
            Category: {
              name: {
                contains: value,
              },
            },
          },
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } else if (type === "warehouse") {
      return res.status(200).json(
        await prisma.article.findMany({
          where: {
            Warehouse: {
              name: {
                contains: value,
              },
            },
          },
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } else {
      return res.status(200).json(
        await prisma.article.findMany({
          where: {
            [type]: {
              contains: value,
            },
          },
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    }
  }

  static async searchArticles({ body }: Request, res: Response) {
    const { search } = body;
    if (!search) {
      return res
        .status(404)
        .json({ message: "Le champ search ne doit pas etre vide" });
    }

    return res.status(200).json(
      await prisma.article.findMany({
        where: {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              designation: {
                contains: search,
              },
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        select: articles,
      })
    );
  }
}

//  Gerer le stock entrant
// Gerer l'enregistrement dans l'historique
