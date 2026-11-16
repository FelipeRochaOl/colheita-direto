export const PHOTO_STORAGE = Symbol('PHOTO_STORAGE');

export interface PhotoUpload {
  uploadUrl: string;
  photoKey: string;
}

/** Armazenamento das fotos de lotes. Fotos nunca vão para o banco; o banco guarda só a chave. */
export interface PhotoStorage {
  createUploadUrl(ownerId: string, contentType: string): Promise<PhotoUpload>;
  createReadUrl(photoKey: string): Promise<string>;
  savePhoto(ownerId: string, content: Buffer, contentType: string): Promise<string>;
  readPhoto(photoKey: string): Promise<Buffer>;
}
