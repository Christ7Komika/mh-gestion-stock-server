import { Request, Response } from "express";
import { prisma } from "../model/prisma";
import { resolve } from "path";
import { unlinkSync } from "fs";

export class SupplierController {
  static async index(req: Request, res: Response) {
    const id: string = req.params.id;
    try {
      const supplier = await prisma.supplier.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          reference: true,
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
      await prisma.supplier.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          reference: {
            select: {
              name: true,
            },
          },
          createdAt: true,
        },
      })
    );
  }

  static async create({ body, file }: Request, res: Response) {
    const { name, reference, phone, email } = body;
    const logo = file?.filename ? resolve(file?.path) : null;

    if (!name) {
      return res
        .status(404)
        .json({ message: "Veuillez inserer le nom du fournisseur" });
    }

    if (email) {
      const supplier = await prisma.supplier.findUnique({
        where: { email: email },
      });
      if (supplier) {
        return res
          .status(400)
          .json({ message: "Adresse mail déjà utilisé par un fournisseur " });
      }
    }

    if (phone) {
      const supplier = await prisma.supplier.findUnique({
        where: { phone: phone },
      });
      if (supplier) {
        return res.status(400).json({
          message: "Numéro de téléphone déjà utilisé par un fournisseur ",
        });
      }
    }

    prisma.supplier
      .create({
        data: {
          logo: logo,
          name: name,
          phone: phone,
          email: email,
          reference: {
            create: {
              name: reference,
            },
          },
        },
      })
      .then(() => {
        return res.status(200).end();
      })
      .catch((e) => {
        return res
          .status(500)
          .json({ message: "La requêtte a échoué", error: e });
      });
  }

  static async update({ body, file, params }: Request, res: Response) {
    const id: string = params.id;
    const { name, reference, phone, email } = body;
    const logo = file?.filename ? resolve(file?.path) : null;

    if (logo) {
      const supplier = await prisma.supplier.findUnique({ where: { id: id } });
      if (supplier && supplier.logo) {
        unlinkSync(supplier.logo);
      }
    }

    try {
      let referenceData = await prisma.supplier.findUnique({
        where: { id: id },
        select: {
          reference: {
            select: {
              id: true,
            },
          },
        },
      });

      const referenceId = (referenceData &&
        referenceData?.reference[0].id) as string;

      await prisma.supplier.update({
        where: {
          id: id,
        },
        data: {
          logo: logo && logo,
          name: name && name,
          phone: phone && phone,
          email: email && email,
          reference: {
            update: {
              where: {
                id: referenceId || "",
              },
              data: {
                name: reference,
              },
            },
          },
        },
      });

      return res.status(200).end();
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

      return res.status(200).end();
    } catch (e) {
      return res
        .status(500)
        .json({ message: "La requête a échoué.", error: e });
    }
  }
}
