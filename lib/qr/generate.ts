/**
 * 会員証QRに含めるデータを生成する。
 * 受付でスキャンしたときにユーザーIDと名前を取得できる形式（JSON文字列）。
 */
export function buildQrCodeData(userId: string, name: string): string {
  return JSON.stringify({ userId, name });
}

/**
 * QRコードデータ文字列をパースする。受付画面でスキャン結果から利用者を特定するときに使用。
 */
export function parseQrCodeData(
  data: string
): { userId: string; name: string } | null {
  try {
    const parsed = JSON.parse(data) as unknown;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'userId' in parsed &&
      'name' in parsed &&
      typeof (parsed as { userId: string; name: string }).userId === 'string' &&
      typeof (parsed as { userId: string; name: string }).name === 'string'
    ) {
      return parsed as { userId: string; name: string };
    }
  } catch {
    // ignore
  }
  return null;
}
