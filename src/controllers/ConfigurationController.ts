import { Response, Request } from "express";
import { prisma } from "../model/prisma";
import bcrypt from "bcryptjs";

export class ConfigurationController {
  static async init(_: Request, res: Response) {
    const hash = bcrypt.hashSync("MH-2023", 10);
    const configuration = await prisma.security.findMany({
      take: 1,
    });
    if (configuration.length > 0) {
      return res.status(400).json({ message: "Mot de passe déja existant" });
    }
    try {
      await prisma.security.create({
        data: {
          password: hash,
        },
      });
      return res.status(200).json(
        (
          await prisma.security.findMany({
            take: 1,
          })
        )[0]
      );
    } catch (e) {
      return res.status(500).json({ message: "La requete a échoué", error: e });
    }
  }

  static async reset(_: Request, res: Response) {
    const hash = bcrypt.hashSync("MH-2023", 10);
    try {
      await prisma.security.create({
        data: {
          password: hash,
        },
      });
      return res.status(200).json(
        (
          await prisma.security.findMany({
            take: 1,
          })
        )[0]
      );
    } catch (e) {
      return res.status(500).json({ message: "La requete a échoué", error: e });
    }
  }

  static async get(_: Request, res: Response) {
    try {
      return res.status(200).json(
        (
          await prisma.security.findMany({
            take: 1,
          })
        )[0]
      );
    } catch (e) {
      return res.status(500).json({ message: "La requete a échoué", error: e });
    }
  }

  static async change(req: Request, res: Response) {
    const { password } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    const { id } = (
      await prisma.security.findMany({
        take: 1,
      })
    )[0];

    try {
      await prisma.security.update({
        where: {
          id: id,
        },
        data: {
          password: hash,
        },
      });
      return res.status(200).json(
        (
          await prisma.security.findMany({
            take: 1,
          })
        )[0]
      );
    } catch (e) {
      return res.status(500).json({ message: "La requete a échoué", error: e });
    }
  }
}
