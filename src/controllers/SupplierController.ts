import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync } from "fs";
import { HistoryService } from "../services/HistoryService";

const suppliersData = {
  id: true,
  logo: true,
  name: true,
  phone: true,
  email: true,
  createdAt: true,
};

export class SupplierController {
  static async index(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      const supplier = await prisma.supplier.findUnique({
        where: {
          id: id,
        },
        select: suppliersData,
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
      await prisma.supplier.findMany({
        select: suppliersData,
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  }

  static async create({ body, file }: Request, res: Response) {
    const { name, phone, email } = body;
    const logo = file?.filename ? resolve(file?.path) : null;

    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom du fournisseur" });
    }

    try {
      const supplier = await prisma.supplier.create({
        data: {
          logo: logo,
          name: name,
          phone: phone,
          email: email,
        },
      });

      await HistoryService.create({
        state: "Ajout",
        type: "Supplier",
        message: `
          Un nouveau fournisseur vient d'être ajouté
          Nom : ${supplier.name}.
          `,
        commentId: null,
      });

      const suppliers = await prisma.supplier.findMany({
        select: suppliersData,
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json(suppliers);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requêtte a échoué", error: e });
    }
  }

  static async update({ body, file, params }: Request, res: Response) {
    const id: string = params.id;
    const { name, phone, email } = body;
    const logo = file?.filename ? resolve(file?.path) : null;

    const data: any = {};
    const supplier = await prisma.supplier.findUnique({ where: { id: id } });
    if (logo) {
      if (supplier && supplier.logo) {
        unlinkSync(supplier.logo);
      }
      data.logo = logo;
    }

    if (name) {
      data.name = name;
    }

    if (phone) {
      data.phone = phone;
    }

    if (email) {
      data.email = email;
    }

    try {
      const supplierData = await prisma.supplier.update({
        where: {
          id: id,
        },
        data: data,
      });

      await HistoryService.create({
        state: "Modification",
        type: "Supplier",
        message: `
        Les informations du fournisseur ${
          supplierData?.name
        } viennent d'être modifié.\n
        ${logo && "Le logo vient d'être modifié\n"}
        ${name && `An: ${supplier?.name} => Nn: ${supplierData.name}\n\n`}
        ${email && `Ae: ${supplier?.email} => Ne: ${supplierData.email}\n`}
        ${phone && `Ap: ${supplier?.phone} => Np: ${supplierData.phone}\n`}.
        `,
        commentId: null,
      });

      const suppliers = await prisma.supplier.findMany({
        select: suppliersData,
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json(suppliers);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requêtte a échoué.", error: e });
    }
  }

  static async destroy(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      const supplier = await prisma.supplier.findUnique({ where: { id: id } });
      if (supplier && supplier.logo) {
        unlinkSync(supplier.logo);
      }
      await prisma.supplier.delete({
        where: {
          id: id,
        },
      });

      await HistoryService.create({
        state: "Suppression",
        type: "Supplier",
        message: `
        Les informations du fournisseur ${supplier?.name} viennent d'être retiré.
        `,
        commentId: null,
      });

      const suppliers = await prisma.supplier.findMany({
        select: suppliersData,
        orderBy: {
          createdAt: "desc",
        },
      });
      return res.status(200).json(suppliers);
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requête a échoué.", error: e });
    }
  }

  static async getHistory(req: Request, res: Response) {
    res.status(200).json(
      await prisma.history.findMany({
        where: {
          type: "Supplier",
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
              type: "Supplier",
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
            type: "Supplier",
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
          orderBy: {
            createdAt: "desc",
          },
        })
      );
    }
  }

  static async searchSuppliers(req: Request, res: Response) {
    const { search } = req.body;
    return res.status(200).json(
      await prisma.supplier.findMany({
        where: {
          name: {
            contains: search,
          },
        },
        select: suppliersData,
        orderBy: {
          createdAt: "desc",
        },
      })
    );
  }
}
