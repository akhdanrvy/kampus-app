// Placeholder type file — replace with output of:
// npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
//
// The index-signature structure below lets every table accept Row/Insert/Update
// operations without TypeScript rejecting them as `never`, while the real schema
// types are not yet generated.

export type Database = {
  public: {
    Tables: {
      [tableName: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: unknown[];
      };
    };
    Views: {
      [viewName: string]: {
        Row: Record<string, unknown>;
        Relationships: unknown[];
      };
    };
    Functions: Record<string, unknown>;
    Enums: Record<string, string>;
  };
};
