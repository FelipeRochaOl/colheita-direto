const MAX_REMEMBERED_TURNS = 20;

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
}

export interface ConversationProps {
  phoneNumber: string;
  turns: ConversationTurn[];
  pendingPhotoKeys: string[];
  updatedAt: Date;
}

/** Memória curta da conversa no WhatsApp: últimas mensagens e fotos ainda não usadas em um lote. */
export class Conversation {
  private constructor(private readonly props: ConversationProps) {}

  static start(phoneNumber: string): Conversation {
    return new Conversation({ phoneNumber, turns: [], pendingPhotoKeys: [], updatedAt: new Date() });
  }

  static restore(props: ConversationProps): Conversation {
    return new Conversation(props);
  }

  get phoneNumber() {
    return this.props.phoneNumber;
  }
  get turns() {
    return [...this.props.turns];
  }
  get pendingPhotoKeys() {
    return [...this.props.pendingPhotoKeys];
  }

  addTurn(turn: ConversationTurn): void {
    this.props.turns.push(turn);
    this.props.turns = this.props.turns.slice(-MAX_REMEMBERED_TURNS);
    this.props.updatedAt = new Date();
  }

  addPendingPhoto(photoKey: string): void {
    this.props.pendingPhotoKeys.push(photoKey);
  }

  takePendingPhotos(): string[] {
    const photoKeys = this.props.pendingPhotoKeys;
    this.props.pendingPhotoKeys = [];
    return photoKeys;
  }

  toSnapshot(): ConversationProps {
    return { ...this.props, turns: [...this.props.turns], pendingPhotoKeys: [...this.props.pendingPhotoKeys] };
  }
}
