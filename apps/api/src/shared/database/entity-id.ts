import { Types } from 'mongoose';

/** Gera o id da entidade no domínio (antes de salvar), compatível com o _id do MongoDB. */
export function generateEntityId(): string {
  return new Types.ObjectId().toHexString();
}
