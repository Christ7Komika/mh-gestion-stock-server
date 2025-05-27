import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync, existsSync } from "fs";
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
  addDate: true,
  initialStock: true,
  outStock: true,
  expirationDate: true,
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
      const article = await prisma.article.findUnique({
        where: {
          id: id,
        },
        select: articles,
      });
      return res.status(200).json(article);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requête a échoué.", error: e });
    }
  }

  static async getBySupplier(req: Request, res: Response) {
    const id: string = req.params.id;
    const step: string = req.params.step;
    const skip: string = req.params.skip;
    const search: string = req.params.search;

    try {
      let articleData: any;
      let total: number;
      if (search !== "empty") {
        articleData = await prisma.article.findMany({
          where: {
            supplierId: id,
            OR: [
              {
                designation: {
                  contains: search,
                },
              },
            ],
          },
          skip: parseInt(skip),
          take: parseInt(step),
          select: articles,
          orderBy: {
            createdAt: "asc",
          },
        });
        total = await prisma.article.count({
          where: {
            supplierId: id,
            OR: [
              {
                designation: {
                  contains: search,
                },
              },
            ],
          },
        });
      } else {
        articleData = await prisma.article.findMany({
          where: {
            supplierId: id,
          },
          skip: parseInt(skip),
          take: parseInt(step),
          select: articles,
          orderBy: {
            createdAt: "asc",
          },
        });
        total = await prisma.article.count({
          where: {
            supplierId: id,
          },
        });
      }

      return res.status(200).json({
        data: articleData,
        count: total,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requête a échoué.", error: e });
    }
  }

  static async getByCategory(req: Request, res: Response) {
    const id: string = req.params.id;
    const step: string = req.params.step;
    const skip: string = req.params.skip;
    const search: string = req.params.search;

    try {
      let articleData: any;
      let total: number;
      if (search !== "empty") {
        articleData = await prisma.article.findMany({
          where: {
            categoryId: id,
            OR: [
              {
                designation: {
                  contains: search,
                },
              },
            ],
          },
          skip: parseInt(skip),
          take: parseInt(step),
          select: articles,
          orderBy: {
            createdAt: "asc",
          },
        });
        total = await prisma.article.count({
          where: {
            categoryId: id,
            OR: [
              {
                designation: {
                  contains: search,
                },
              },
            ],
          },
        });
      } else {
        articleData = await prisma.article.findMany({
          where: {
            categoryId: id,
          },
          skip: parseInt(skip),
          take: parseInt(step),
          select: articles,
          orderBy: {
            createdAt: "asc",
          },
        });
        total = await prisma.article.count({
          where: {
            categoryId: id,
          },
        });
      }

      return res.status(200).json({
        data: articleData,
        count: total,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requête a échoué.", error: e });
    }
  }

  static async getByWarehouse(req: Request, res: Response) {
    const id: string = req.params.id;
    const step: string = req.params.step;
    const skip: string = req.params.skip;
    const search: string = req.params.search;

    try {
      let articleData: any;
      let total: number;
      if (search !== "empty") {
        articleData = await prisma.article.findMany({
          where: {
            warehouseId: id,
            OR: [
              {
                designation: {
                  contains: search,
                },
              },
            ],
          },
          skip: parseInt(skip),
          take: parseInt(step),
          select: articles,
          orderBy: {
            createdAt: "asc",
          },
        });
        total = await prisma.article.count({
          where: {
            warehouseId: id,
            OR: [
              {
                designation: {
                  contains: search,
                },
              },
            ],
          },
        });
      } else {
        articleData = await prisma.article.findMany({
          where: {
            warehouseId: id,
          },
          skip: parseInt(skip),
          take: parseInt(step),
          select: articles,
          orderBy: {
            createdAt: "asc",
          },
        });
        total = await prisma.article.count({
          where: {
            warehouseId: id,
          },
        });
      }

      return res.status(200).json({
        data: articleData,
        count: total,
      });
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requête a échoué.", error: e });
    }
  }

  static async all(_: Request, res: Response) {
    const articlesData = await prisma.article.findMany({
      select: articles,
      take: 25,
      orderBy: {
        createdAt: "desc",
      },
    });
    const count = await prisma.article.count();

    return res.status(200).json({ data: articlesData, count });
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
      addDate,
      initialStock,
      expirationDate,
      operatingPressure,
      diameter,
      fluid,
      reference,
      supplier,
      warehouse,
      category,
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
          code: code || "Aucun",
          type: type || "Aucun",
          designation: designation,
          quantity: parseFloat(quantity),
          hasLength: hasLength === "true" ? true : false,
          addDate: addDate ? new Date(addDate) : null,
          initialStock: initialStock,
          purchasePrice: purchasePrice,
          sellingPrice: sellingPrice,
          expirationDate: expirationDate ? new Date(expirationDate) : null,
          unitPrice: unitPrice,
          lotNumber: lotNumber,
          operatingPressure: operatingPressure,
          diameter: diameter,
          fluid: fluid,
          reference: reference || "Aucun",
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
      });

      try {
        const inComingStore: InCommingStore = {
          articleId: article.id,
          articleName: article.name,
          quantity: article.quantity,
          purchasePrice: article.purchasePrice,
          designation: article.designation,
          hasLength: article.hasLength as boolean,
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
      addDate,
      initialStock,
      expirationDate,
      unitPrice,
      lotNumber,
      operatingPressure,
      diameter,
      fluid,
      reference,
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
      if (expirationDate) {
        data.expirationDate = new Date(expirationDate);
      }
      if (designation) {
        data.designation = designation;
      }
      if (purchasePrice) {
        data.purchasePrice = purchasePrice;
      }

      if (addDate) {
        data.addDate = addDate;
      }

      if (initialStock) {
        data.initialStock = initialStock;
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
    const { quantity } = body;

    try {
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
            },
          });

          try {
            const inComingStore: InCommingStore = {
              articleId: article.id,
              articleName: article.name,
              quantity: quantity,
              designation: article.designation,
              hasLength: article.hasLength as boolean,
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
    const { quantity } = body;

    try {

      const articleData = await prisma.article.findUniqueOrThrow({
        where: { id },
      });

      if (articleData) {
        try {
          await prisma.article.update({
            where: {
              id: articleData.id,
            },
            data: {
              quantity: parseFloat(quantity),
            },
          });

          try {
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
    const { warehouse } = body;

    try {
      await prisma.article.update({
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
    const { warehouse, quantity, currentQuantity, hasLength } = body;

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
    const { supplier } = body;

    try {
      await prisma.article.update({
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
    const { category } = body;

    try {
      await prisma.article.update({
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
      const article = await prisma.article.delete({ where: { id }, select: { image: true } });
      if (article?.image && existsSync(article.image)) {
        unlinkSync(article?.image);
      }
      return res.status(200).json(
        await prisma.article.findMany({
          select: articles,
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    } catch (e) {
      console.log({ e })
      return res.status(500).json({ message: "La requête a échoué", error: e });
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
          Ticket: true,
        },
      });

      return res.status(200).json(articles);
    } catch (error) {
      return res.status(400).json({
        message: "Erreur lors de la filtration des articles",
        error: error,
      });
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

  static async notification(_: Request, res: Response) {
    return res.status(200).json(
      await prisma.article.findMany({
        where: {
          quantity: {
            gt: 5,
            lte: 15,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          _count: true,
          name: true,
          code: true,
          designation: true,
          hasLength: true,
          quantity: true,
          Supplier: {
            select: {
              name: true,
            },
          },
          Warehouse: {
            select: {
              name: true,
            },
          },
        },
      })
    );
  }

  static async warning(_: Request, res: Response) {
    return res.status(200).json(
      await prisma.article.findMany({
        where: {
          quantity: {
            lte: 5,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          code: true,
          _count: true,
          name: true,
          designation: true,
          hasLength: true,
          quantity: true,
          Supplier: {
            select: {
              name: true,
            },
          },
          Warehouse: {
            select: {
              name: true,
            },
          },
        },
      })
    );
  }
}
