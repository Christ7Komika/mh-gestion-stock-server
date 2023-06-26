import { Request, Response } from "express";

export class StallController {
  static async index(req: Request, res: Response) {
    return res.json("Get Stall");
  }
  static async all(req: Request, res: Response) {
    return res.json("Get Stalls");
  }
  static async create(req: Request, res: Response) {
    return res.json("Create Stall ");
  }
  static async update(req: Request, res: Response) {
    return res.json("Update Stall ");
  }
  static async destroy(req: Request, res: Response) {
    return res.json("Destroy Stall");
  }
}
