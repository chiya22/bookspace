/**
 * Supabase のテーブル型定義（マイグレーションと同期させる）。
 * マイグレーション変更時にここも更新すること。
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'user' | 'librarian' | 'admin';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string;
          display_name: string | null;
          role: UserRole;
          qr_code_data: string | null;
          disabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name: string;
          display_name?: string | null;
          role: UserRole;
          qr_code_data?: string | null;
          disabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string;
          display_name?: string | null;
          role?: UserRole;
          qr_code_data?: string | null;
          disabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      books: {
        Row: {
          id: string;
          title: string;
          author: string;
          publisher: string;
          isbn: string;
          cover_image_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          author: string;
          publisher: string;
          isbn: string;
          cover_image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          author?: string;
          publisher?: string;
          isbn?: string;
          cover_image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      loans: {
        Row: {
          id: string;
          user_id: string;
          book_id: string;
          lent_at: string;
          returned_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_id: string;
          lent_at: string;
          returned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_id?: string;
          lent_at?: string;
          returned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string; created_at?: string };
        Update: { id?: string; name?: string; created_at?: string };
      };
      book_tags: {
        Row: { book_id: string; tag_id: string };
        Insert: { book_id: string; tag_id: string };
        Update: { book_id?: string; tag_id?: string };
      };
      book_comments: {
        Row: {
          id: string;
          book_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          book_id: string;
          user_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          book_id?: string;
          user_id?: string;
          body?: string;
          created_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          kind: string;
          recipient_user_id: string | null;
          recipient_email: string;
          subject: string | null;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: string;
          recipient_user_id?: string | null;
          recipient_email: string;
          subject?: string | null;
          sent_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          kind?: string;
          recipient_user_id?: string | null;
          recipient_email?: string;
          subject?: string | null;
          sent_at?: string;
          created_at?: string;
        };
      };
      password_reset_tokens: {
        Row: {
          id: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token_hash: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token_hash?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
      pending_registrations: {
        Row: {
          id: string;
          email: string;
          name: string;
          display_name: string | null;
          password_hash: string;
          token_hash: string;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          display_name?: string | null;
          password_hash: string;
          token_hash: string;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          display_name?: string | null;
          password_hash?: string;
          token_hash?: string;
          expires_at?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
