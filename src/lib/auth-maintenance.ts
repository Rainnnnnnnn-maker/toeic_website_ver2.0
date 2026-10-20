// Google OAuth クライアントが使えない間（例: 401 deleted_client）、/login の新規ログイン導線を止める。
// ログイン済みのセッションは Supabase 側で維持されるため、既存ユーザーはそのまま利用できる。
// 復旧したら false に戻す。手順は docs/operations/phase1-login-favorites-sync-setup.md §10。
export const LOGIN_MAINTENANCE = true;
