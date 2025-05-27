import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync } from "fs";

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
