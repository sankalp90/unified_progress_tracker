export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface PlatformProfile {
  id: number;
  platform: string;
  user_id: number;
  username: string;
  verified: boolean;
}

export interface CodingStats {
  id: number;
  platform: string;
  solved: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  platform: string;
  achievement_type: string;
  badge_url: string | null;
  verified: boolean;
  achieved_at: string;
  user_id: number;
}

export interface DashboardProfile {
  platform: string;
  username: string;
  verified: boolean;
}

export interface DashboardCodingStats {
  solved: number;
  easy: number;
  medium: number;
  hard: number;
  lcs: number;
}

export interface DashboardGithub {
  username: string;
  repos: number;
  followers: number;
  following: number;
}

export interface DashboardCodeforces {
  rating: number | null;
  max_rating: number | null;
  rank: string | null;
  max_rank: string | null;
}

export interface DashboardStreaks {
  current_streak: number;
  longest_streak: number;
}

export interface HeatmapEntry {
  date: string;
  count: number;
}

export interface RecentActivityEntry {
  date: string;
  leetcode: number;
  codeforces: number;
  github: number;
  total: number;
}

export interface ProgressStats {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface Dashboard {
  user: { id: number; name: string; email: string };
  profiles: DashboardProfile[];
  coding_stats: DashboardCodingStats;
  github: DashboardGithub | null;
  codeforces: DashboardCodeforces | null;
  achievement_count: number;
  streaks: DashboardStreaks;
  heatmap: HeatmapEntry[];
  recent_activity: RecentActivityEntry[];
  score: number;
  progress: ProgressStats;
}

export interface LeaderboardEntry {
  user_id: number;
  name: string;
  username: string;
  score: number;
  solved: number;
  achievements: number;
  codeforces_rating: number;
  rank: number;
}

export interface PublicProfile {
  profile_url: string;
  user: { name: string; username: string };
  profiles: DashboardProfile[];
  coding_stats: DashboardCodingStats;
  github: DashboardGithub | null;
  codeforces: DashboardCodeforces | null;
  achievement_count: number;
  achievements: {
    title: string;
    description: string;
    platform: string;
    achieved_at: string;
  }[];
  streaks: DashboardStreaks;
  heatmap: HeatmapEntry[];
  score: number;
}

export interface SyncResponse {
  message: string;
  platforms_synced: string[];
  failed: { platform: string; error: string }[];
}

export type Platform = "leetcode" | "codeforces" | "github";
