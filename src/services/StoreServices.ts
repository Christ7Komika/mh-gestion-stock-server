import { prisma } from "../model/prisma";

export class StoreService {
  static async inCommingStore(id: string): Promise<boolean> {
    try {
      await prisma.inComingStore.create({
        data: {
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
