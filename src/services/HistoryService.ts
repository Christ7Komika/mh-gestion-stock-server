import { prisma } from "../model/prisma";

interface History {
  state:
    | "Création"
    | "Ajout"
    | "Mis à jour"
    | "Modification"
    | "Suppression"
    | "Retrait"
    | "Validation"
    | "Annulation";
  type: "Article" | "Ticket" | "Client";
  message: string;
  commentId: string | null;
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
