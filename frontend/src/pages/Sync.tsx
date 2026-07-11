import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import BoltIcon from "@mui/icons-material/Bolt";
import SyncIcon from "@mui/icons-material/Sync";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { api } from "../api/client";
import { useUser } from "../hooks/useUser";
import type { PlatformProfile, SyncResponse } from "../types";
import PlatformBadge from "../components/PlatformBadge";
import LoadingSpinner from "../components/LoadingSpinner";

type SyncStatus = "idle" | "syncing" | "success" | "error";

interface PlatformSyncState {
  status: SyncStatus;
  message?: string;
}

const platformMeta: Record<
  string,
  { label: string; color: string; description: string }
> = {
  leetcode: {
    label: "LeetCode",
    color: "#ed6c02",
    description: "Solved problems & submission history",
  },
  codeforces: {
    label: "Codeforces",
    color: "#0288d1",
    description: "Rating, rank & contest submissions",
  },
  github: {
    label: "GitHub",
    color: "#7b1fa2",
    description: "Repos, followers & contribution calendar",
  },
};

function StatusIcon({ status }: { status: SyncStatus }) {
  if (status === "syncing") return <SyncIcon color="primary" sx={{ animation: "spin 1s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } }} />;
  if (status === "success") return <CheckCircleIcon color="success" />;
  if (status === "error") return <ErrorIcon color="error" />;
  return <ScheduleIcon color="disabled" />;
}

export default function Sync() {
  const { activeUser } = useUser();
  const [profiles, setProfiles] = useState<PlatformProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [platformStates, setPlatformStates] = useState<
    Record<string, PlatformSyncState>
  >({});
  const [allSyncing, setAllSyncing] = useState(false);
  const [historySyncing, setHistorySyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResponse | null>(null);

  const loadProfiles = async () => {
    if (!activeUser) {
      setProfiles([]);
      return;
    }
    setLoadingProfiles(true);
    try {
      const data = await api.getUserProfiles(activeUser.id);
      setProfiles(data);
      const initial: Record<string, PlatformSyncState> = {};
      data.forEach((p) => {
        initial[p.platform] = { status: "idle" };
      });
      setPlatformStates(initial);
    } catch {
      setProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [activeUser?.id]);

  const setPlatformStatus = (
    platform: string,
    status: SyncStatus,
    message?: string
  ) => {
    setPlatformStates((prev) => ({
      ...prev,
      [platform]: { status, message },
    }));
  };

  const syncPlatform = async (profile: PlatformProfile) => {
    if (!activeUser) return;
    setPlatformStatus(profile.platform, "syncing");
    try {
      if (profile.platform === "leetcode") {
        await api.syncLeetcode(activeUser.id, profile.username);
      } else if (profile.platform === "codeforces") {
        await api.syncCodeforces(activeUser.id, profile.username);
      } else if (profile.platform === "github") {
        await api.syncGithub(activeUser.id, profile.username);
      }
      setPlatformStatus(profile.platform, "success", "Stats updated");
    } catch (e) {
      setPlatformStatus(
        profile.platform,
        "error",
        e instanceof Error ? e.message : "Sync failed"
      );
    }
  };

  const handleSyncAll = async () => {
    if (!activeUser) return;
    setAllSyncing(true);
    setLastResult(null);
    profiles.forEach((p) => setPlatformStatus(p.platform, "syncing"));
    try {
      const result = await api.syncAll(activeUser.id);
      setLastResult(result);
      result.platforms_synced.forEach((p) =>
        setPlatformStatus(p, "success", "Synced")
      );
      result.failed.forEach((f) =>
        setPlatformStatus(f.platform, "error", f.error)
      );
      profiles
        .filter(
          (p) =>
            !result.platforms_synced.includes(p.platform) &&
            !result.failed.some((f) => f.platform === p.platform)
        )
        .forEach((p) => setPlatformStatus(p.platform, "idle"));
    } catch (e) {
      profiles.forEach((p) =>
        setPlatformStatus(
          p.platform,
          "error",
          e instanceof Error ? e.message : "Sync failed"
        )
      );
    } finally {
      setAllSyncing(false);
    }
  };

  const handleSyncHistory = async () => {
    if (!activeUser) return;
    setHistorySyncing(true);
    setLastResult(null);
    profiles.forEach((p) => setPlatformStatus(p.platform, "syncing"));
    try {
      const result = await api.syncHistory(activeUser.id);
      setLastResult(result);
      result.platforms_synced.forEach((p) =>
        setPlatformStatus(p, "success", "History synced")
      );
      result.failed.forEach((f) =>
        setPlatformStatus(f.platform, "error", f.error)
      );
    } catch (e) {
      profiles.forEach((p) =>
        setPlatformStatus(
          p.platform,
          "error",
          e instanceof Error ? e.message : "History sync failed"
        )
      );
    } finally {
      setHistorySyncing(false);
    }
  };

  if (!activeUser) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Card>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8, textAlign: "center" }}>
            <BoltIcon color="primary" sx={{ fontSize: 56 }} />
            <Typography variant="h5">Login to sync</Typography>
            <Typography variant="body2" color="text.secondary">
              Login with your password, then link platforms in Setup.
            </Typography>
            <Button component={Link} to="/login" variant="contained">
              Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h4">Sync Platforms</Typography>
          <Typography variant="body2" color="text.secondary">
            Pull live stats and submission history from linked accounts.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Button
            onClick={handleSyncAll}
            disabled={allSyncing || historySyncing || profiles.length === 0}
            variant="contained"
            size="large"
            fullWidth
            startIcon={<SyncIcon sx={allSyncing ? { animation: "spin 1s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } } : undefined} />}
            sx={{ py: 2 }}
          >
            {allSyncing ? "Syncing All Platforms..." : "Sync All Stats"}
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Button
            onClick={handleSyncHistory}
            disabled={allSyncing || historySyncing || profiles.length === 0}
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<HistoryIcon sx={historySyncing ? { animation: "spin 1s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } } : undefined} />}
            sx={{ py: 2 }}
          >
            {historySyncing ? "Syncing History..." : "Sync Full History + Achievements"}
          </Button>
        </Grid>
      </Grid>

      {lastResult && (
        <Alert
          severity={lastResult.failed.length > 0 ? "warning" : "success"}
          icon={lastResult.failed.length > 0 ? <WarningAmberIcon /> : <CheckCircleIcon />}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {lastResult.message}
          </Typography>
          {lastResult.platforms_synced.length > 0 && (
            <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
              Synced: {lastResult.platforms_synced.join(", ")}
            </Typography>
          )}
          {lastResult.failed.length > 0 && (
            <Box component="ul" sx={{ mt: 1, pl: 2, mb: 0 }}>
              {lastResult.failed.map((f) => (
                <Typography component="li" variant="caption" key={f.platform}>
                  {f.platform}: {f.error}
                </Typography>
              ))}
            </Box>
          )}
        </Alert>
      )}

      {loadingProfiles ? (
        <LoadingSpinner text="Loading profiles..." />
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No platforms linked yet. Link your accounts in Setup.
            </Typography>
            <Button component={Link} to="/setup" variant="contained">
              Link Platforms
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {profiles.map((profile) => {
            const meta = platformMeta[profile.platform] ?? {
              label: profile.platform,
              color: "#616161",
              description: "Platform data",
            };
            const state = platformStates[profile.platform] ?? {
              status: "idle" as SyncStatus,
            };

            return (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={profile.id}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: `${meta.color}18`,
                          color: meta.color,
                          fontWeight: 700,
                          fontSize: "0.875rem",
                        }}
                      >
                        {meta.label.slice(0, 2)}
                      </Box>
                      <StatusIcon status={state.status} />
                    </Box>

                    <Typography variant="h6">{meta.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      {meta.description}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <PlatformBadge
                        platform={profile.platform}
                        username={profile.username}
                        verified={profile.verified}
                        size="sm"
                      />
                    </Box>

                    {state.message && (
                      <Typography
                        variant="caption"
                        sx={{ mt: 1.5, display: "block" }}
                        color={
                          state.status === "error"
                            ? "error.main"
                            : state.status === "success"
                              ? "success.main"
                              : "text.secondary"
                        }
                      >
                        {state.message}
                      </Typography>
                    )}

                    <Button
                      onClick={() => syncPlatform(profile)}
                      disabled={state.status === "syncing" || allSyncing || historySyncing}
                      variant="outlined"
                      size="small"
                      fullWidth
                      startIcon={<SyncIcon sx={state.status === "syncing" ? { animation: "spin 1s linear infinite", "@keyframes spin": { to: { transform: "rotate(360deg)" } } } : undefined} />}
                      sx={{ mt: 2 }}
                    >
                      Sync {meta.label}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {profiles.length > 0 && (
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              After syncing, view your updated stats on the{" "}
              <Typography component={Link} to="/dashboard" variant="body2" color="primary" sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                Dashboard
              </Typography>{" "}
              or share your{" "}
              <Typography component={Link} to={`/profile/${activeUser.username}`} variant="body2" color="primary" sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                public profile
              </Typography>
              .
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
