import { prisma } from "../model/prisma";

export class StoreService {
  static async inCommingStore(name: string, id: string): Promise<boolean> {
    try {
      await prisma.inComingStore.create({
        data: {
          articleName: name,
          articleId: id,
        },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
  static async outGoingStore() {}
}
