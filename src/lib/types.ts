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
  is_current?: boolean;
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
  status: 'scheduled' | 'finished' | 'postponed' | 'live';
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

export interface ClubAnnualStanding {
  team: Team;
  divisionPoints: Record<string, number>; // Mapeo division_id -> puntos
  totalPoints: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
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

export interface Sponsor {
  id: string;
  name: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

export interface PushSubscription {
  id: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  team_id: string;
  created_at?: string;
}

export type PollVoteOption = 'yes' | 'no';

export interface Poll {
  id: string;
  title: string;
  description: string;
  option_yes_label: string;
  option_no_label: string;
  yes_votes: number;
  no_votes: number;
  expires_at: string; // ISO string e.g. 2026-09-20T23:59:59.000Z
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

