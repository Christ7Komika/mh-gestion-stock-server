import { Request, Response } from "express";

export class HistoryController {
  static async index(req: Request, res: Response) {
    return res.json("Get History");
  }
  static async all(req: Request, res: Response) {
    return res.json("Get Histories");
  }
  static async create(req: Request, res: Response) {
    return res.json("Create History ");
  }
  static async update(req: Request, res: Response) {
    return res.json("Update History ");
  }
  static async destroy(req: Request, res: Response) {
    return res.json("Destroy History");
  }
}
