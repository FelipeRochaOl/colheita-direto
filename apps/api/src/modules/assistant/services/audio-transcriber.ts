export const AUDIO_TRANSCRIBER = Symbol('AUDIO_TRANSCRIBER');

/** Converte áudio do produtor em texto (pt-BR). */
export interface AudioTranscriber {
  transcribe(audio: Buffer, mimeType: string): Promise<string>;
}
