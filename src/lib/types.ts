export interface Team {
  id: string;
  name: string;           // nombre canonical completo
  display_name?: string;  // nombre corto para la UI (opcional)
  logo_url: string | null;
  website_url?: string | null;
  instagram_url?: string | null;
  deleted_at?: string | null;
}

export interface Tournament {
  id: string;
  name: string; // e.g. "Apertura"
  year: number; // e.g. 2026
}

export interface Division {
  id: string;
  name: string;
  sort_order: number;
}

export interface Zone {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  division_id: string;
  zone_id: string;
  round_number: number;
  home_team_id: string;
  away_team_id: string;
  home_goals: number | null;
  away_goals: number | null;
  status: 'scheduled' | 'finished' | 'postponed';
  match_date: string | null;
}

export interface Standing {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface User {
  id: string;
  username: string;
  role: 'super_admin' | 'editor';
  is_active: boolean;
  created_at: string;
}

export interface ContactMessage {
  id: string;
  email: string;
  title: string;
  body: string;
  is_read: boolean;
  is_deleted: boolean;
  created_at: string;
}
