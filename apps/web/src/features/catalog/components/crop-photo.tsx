import { PictureOutlined } from '@ant-design/icons';
import { useState } from 'react';

/** Placeholder para o `fallback` do <Image> do antd quando a foto não carrega. */
export const PHOTO_FALLBACK_SRC = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e6f4ea"/><text x="200" y="158" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#3d6b55">Foto indisponível</text></svg>',
)}`;

/**
 * Foto de lote/oferta com fallback: se a URL assinada falhar (expirada, objeto ausente no S3),
 * mostra um aviso no lugar do ícone de imagem quebrada.
 */
export function CropPhoto({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  // Guarda a URL que falhou: uma URL nova (refetch) tenta carregar de novo
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src)
    return (
      <div
        role="img"
        aria-label={alt || 'Foto indisponível'}
        className={`grid place-items-center bg-mint text-green-dark ${className ?? ''}`}
      >
        <span className="flex flex-col items-center gap-1 text-xs font-medium">
          <PictureOutlined className="text-2xl" />
          Foto indisponível
        </span>
      </div>
    );

  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailedSrc(src)} />;
}
