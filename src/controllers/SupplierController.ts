import { Request, Response } from "express";

export class SuppliersController {
  static async index(req: Request, res: Response) {
    return res.json("Get Fournisseur");
  }
  static async all(req: Request, res: Response) {
    return res.json("Get Fournisseurs");
  }
  static async create(req: Request, res: Response) {
    return res.json("Create Fournisseur ");
  }
  static async update(req: Request, res: Response) {
    return res.json("Update Fournisseur ");
  }
  static async destroy(req: Request, res: Response) {
    return res.json("Destroy Fournisseur");
  }
}
