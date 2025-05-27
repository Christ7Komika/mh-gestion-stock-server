import { prisma } from "../model/prisma";

export interface History {
  state:
    | "Création"
    | "Ajout"
    | "Mis à jour"
    | "Modification"
    | "Suppression"
    | "Retrait"
    | "Validation"
    | "Annulation";
  type: "Article" | "Bon de sortie" | "Client" | "Supplier" | "Ticket";
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
