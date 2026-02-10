import QRCode from 'qrcode';

/**
 * テキスト（会員証QRのJSON文字列など）をQRコード画像の Data URL に変換する。
 * Server Component で img の src に渡す用。
 */
export async function qrCodeToDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { width: 256, margin: 1 });
}
