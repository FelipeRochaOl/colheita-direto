export const INBOUND_MESSAGE_LEDGER = Symbol('INBOUND_MESSAGE_LEDGER');

/**
 * Registro das mensagens do WhatsApp já processadas. A Meta pode entregar a mesma mensagem
 * mais de uma vez e o SQS reentrega em caso de falha: sem isso, as tools rodariam de novo.
 */
export interface InboundMessageLedger {
  /** true se a mensagem é nova (e fica registrada); false se já foi processada. */
  tryRegister(messageId: string): Promise<boolean>;
}
