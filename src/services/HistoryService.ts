import { prisma } from "../model/prisma";

interface History {
  state:
    | "Création"
    | "Ajout"
    | "Mis à jour"
    | "Suppression"
    | "Retrait"
    | "Validation"
    | "Annulation";
  type: "Article" | "Ticket";
  message: string;
  commentId: string;
}

export class HistoryService {
  static async create({
    state,
    type,
    message,
    commentId,
  }: History): Promise<boolean> {
    try {
      await prisma.history.create({
        data: {
          state: state,
          type: type,
          message: message,
          commentId: commentId,
        },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
