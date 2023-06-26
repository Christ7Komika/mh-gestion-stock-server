import { Request, Response } from "express";

export class WarehouseController {
  static async index(req: Request, res: Response) {
    return res.json("Get Warehouse");
  }
  static async all(req: Request, res: Response) {
    return res.json("Get Warehouses");
  }
  static async create(req: Request, res: Response) {
    return res.json("Create Warehouse ");
  }
  static async update(req: Request, res: Response) {
    return res.json("Update Warehouse ");
  }
  static async destroy(req: Request, res: Response) {
    return res.json("Destroy Warehouse");
  }
}
