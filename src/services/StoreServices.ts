import { prisma } from "../model/prisma";

export interface InCommingStore {
  articleId: string;
  articleName: string;
  designation: string;
  purchasePrice?: string | null;
  quantity: number;
  hasLength: boolean;
  messageId?: string;
}

export class StoreService {
  static async inComingStore(data: InCommingStore): Promise<boolean> {
    try {
      await prisma.inComingStore.create({
        data: {
          articleId: data.articleId,
          articleName: data.articleName,
          designation: data.designation,
          quantity: parseFloat(data.quantity.toString()),
          hasLength: data.hasLength,
          comment: {
            connect: {
              id: data.messageId,
            },
          },
        },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
