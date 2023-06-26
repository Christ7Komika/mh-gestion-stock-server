import { Request, Response } from "express";

export class ArticlesController {
  static async index(req: Request, res: Response) {
    return res.json("Get Article");
  }
  static async all(req: Request, res: Response) {
    return res.json("Get Articles");
  }
  static async create(req: Request, res: Response) {
    return res.json("Create Article ");
  }
  static async update(req: Request, res: Response) {
    return res.json("Update Article ");
  }
  static async destroy(req: Request, res: Response) {
    return res.json("Destroy Article");
  }
}
