// Placeholder type file — replace with output of:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

export type Database = {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
};
