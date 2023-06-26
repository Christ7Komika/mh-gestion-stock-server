import { Request, Response } from "express";

export class ClientController {
  static async index(req: Request, res: Response) {
    return res.json("Get Client");
  }
  static async all(req: Request, res: Response) {
    return res.json("Get Clients");
  }
  static async create(req: Request, res: Response) {
    return res.json("Create Client ");
  }
  static async update(req: Request, res: Response) {
    return res.json("Update Client ");
  }
  static async destroy(req: Request, res: Response) {
    return res.json("Destroy Client");
  }
}
