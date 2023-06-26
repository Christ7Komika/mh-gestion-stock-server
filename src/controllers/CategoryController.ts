import { Request, Response } from "express";

export class CategoryController {
  static async index(req: Request, res: Response) {
    return res.json("Get Category");
  }
  static async all(req: Request, res: Response) {
    return res.json("Get Categories");
  }
  static async create(req: Request, res: Response) {
    return res.json("Create Category ");
  }
  static async update(req: Request, res: Response) {
    return res.json("Update Category ");
  }
  static async destroy(req: Request, res: Response) {
    return res.json("Destroy Category");
  }
}
