import type {
  CodingStats,
  Dashboard,
  LeaderboardEntry,
  PlatformProfile,
  PublicProfile,
  SyncResponse,
  User,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  getUsers: () => request<User[]>("/users/"),
  getUser: (id: number) => request<User>(`/users/${id}`),
  getUserByUsername: (username: string) =>
    request<User>(`/users/username/${username}`),
  createUser: (data: { name: string; username: string; email: string; password: string }) =>
    request<User>("/users/", { method: "POST", body: JSON.stringify(data) }),
  loginUser: (data: { username: string; password: string }) =>
    request<User>("/users/login", { method: "POST", body: JSON.stringify(data) }),

  getUserProfiles: (userId: number) =>
    request<PlatformProfile[]>(`/users/${userId}/profiles`),
  createProfile: (data: {
    platform: string;
    user_id: number;
    username: string;
    verified?: boolean;
  }) =>
    request<PlatformProfile>("/profiles/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteProfile: (id: number) =>
    request<{ message: string }>(`/profiles/${id}`, { method: "DELETE" }),

  getDashboard: (userId: number) =>
    request<Dashboard>(`/dashboard/${userId}`),
  getLeaderboard: () =>
    request<{ leaderboard: LeaderboardEntry[] }>("/leaderboard/"),
  getPublicProfile: (username: string) =>
    request<PublicProfile>(`/public/${username}`),

  syncAll: (userId: number) =>
    request<SyncResponse>(`/sync/all/${userId}`, { method: "POST" }),
  syncHistory: (userId: number) =>
    request<SyncResponse>(`/sync/history/${userId}`, { method: "POST" }),
  syncLeetcode: (userId: number, username: string) =>
    request<CodingStats>(
      `/sync/leetcode/${userId}?username=${encodeURIComponent(username)}`,
      { method: "POST" }
    ),
  syncCodeforces: (userId: number, handle: string) =>
    request<CodingStats>(
      `/sync/codeforces/${userId}?handle=${encodeURIComponent(handle)}`,
      { method: "POST" }
    ),
  syncGithub: (userId: number, username: string) =>
    request<{ id: number; username: string; public_repos: number; followers: number; following: number }>(
      `/sync/github/${userId}?username=${encodeURIComponent(username)}`,
      { method: "POST" }
    ),
};
