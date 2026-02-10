/**
 * アプリ全体で使うエラー・通知メッセージ（日本語で統一）
 */
export const messages = {
  // 認証・権限
  loginRequired: 'ログインしてください。',
  noPermission: '権限がありません。',

  // 必須入力
  required: '入力してください。',
  requiredTitleAuthorPublisherIsbn: 'タイトル・著者・出版社・ISBNは必須です。',
  requiredNameAndEmail: '名前とメールは必須です。',
  requiredEmailPasswordName: 'メール・パスワード・名前を入力してください。',
  requiredTagName: 'タグ名を入力してください。',
  requiredIsbn: 'ISBNを入力してください。',

  // 対象未指定
  userNotSpecified: '利用者が指定されていません。',
  tagNotSpecified: 'タグが指定されていません。',

  // 検索・存在
  userNotFound: '利用者が見つかりません。',
  bookNotFound: '該当する蔵書が見つかりません。',
  loanNotFound: '該当する貸出がありません。',

  // 重複・制約（23505 等）
  emailAlreadyUsed: 'このメールアドレスは既に登録されています。',
  emailAlreadyInUse: 'このメールアドレスは既に使用されています。',
  isbnAlreadyRegistered: 'このISBNは既に登録されています。',
  tagNameAlreadyUsed: 'このタグ名は既に使用されています。',

  // 業務ルール
  passwordMinLength: 'パスワードは8文字以上にしてください。',
  bookOnLoan: 'この書籍は現在貸出中です。',
  userAlreadyHasLoan: 'この利用者は既に1冊貸出中です。',
  scanQrOrEnterUserId: '会員証QRコードをスキャンするか、利用者IDを入力してください。',

  // 操作失敗（汎用）
  failedToAdd: '追加に失敗しました。',
  failedToUpdate: '更新に失敗しました。',
  failedToDelete: '削除に失敗しました。',
  failedToRegister: '登録に失敗しました。',
  failedToRegisterRetry: '登録に失敗しました。しばらくしてから再度お試しください。',
  failedToUploadCover: '表紙のアップロードに失敗しました。',
  failedToAddTag: 'タグの追加に失敗しました。',
  failedToLend: '貸出登録に失敗しました。',
  failedToReturn: '返却登録に失敗しました。',
  mailSendFailed: (detail?: string) =>
    detail ? `メール送信に失敗しました: ${detail}` : 'メール送信に失敗しました。',
} as const;
