import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import BoltIcon from "@mui/icons-material/Bolt";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import CodeIcon from "@mui/icons-material/Code";
import { api } from "../api/client";
import { useUser } from "../hooks/useUser";
import type { Dashboard } from "../types";
import StatCard from "../components/StatCard";
import Heatmap from "../components/Heatmap";
import ActivityChart from "../components/ActivityChart";
import PlatformBadge from "../components/PlatformBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Dashboard() {
  const { activeUser } = useUser();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    if (!activeUser) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getDashboard(activeUser.id);
      setDashboard(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activeUser?.id]);

  if (!activeUser) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Card>
          <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 8, textAlign: "center" }}>
            <BoltIcon color="primary" sx={{ fontSize: 56 }} />
            <Typography variant="h5">Login to view dashboard</Typography>
            <Typography variant="body2" color="text.secondary">
              Login with your username and password, or create an account first.
            </Typography>
            <Button component={Link} to="/login" variant="contained">
              Login
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadDashboard} />;
  if (!dashboard) return null;

  const { coding_stats: stats, streaks, progress } = dashboard;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h4">Welcome back, {dashboard.user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {dashboard.user.email}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Unified Score" value={dashboard.score.toLocaleString()} icon={MilitaryTechIcon} color="#1976d2" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Problems Solved" value={stats.solved} icon={TrackChangesIcon} color="#0288d1" subtitle={`E:${stats.easy} M:${stats.medium} H:${stats.hard}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Current Streak" value={`${streaks.current_streak}d`} icon={LocalFireDepartmentIcon} color="#d32f2f" subtitle={`Best: ${streaks.longest_streak} days`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Achievements" value={dashboard.achievement_count} icon={EmojiEventsIcon} color="#ed6c02" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Today" value={progress.daily} icon={TrendingUpIcon} color="#2e7d32" subtitle="activities" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="This Week" value={progress.weekly} icon={TrendingUpIcon} color="#2e7d32" subtitle="activities" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="This Month" value={progress.monthly} icon={TrendingUpIcon} color="#2e7d32" subtitle="activities" />
        </Grid>
      </Grid>

      {dashboard.profiles.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: "block" }}>
              Linked Platforms
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {dashboard.profiles.map((p) => (
                <PlatformBadge key={p.platform} platform={p.platform} username={p.username} verified={p.verified} />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {dashboard.github && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ minWidth: 0 }}>
                <Typography variant="overline" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <CodeIcon fontSize="small" /> GitHub
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
                    gap: 1.5,
                  }}
                >
                  {[
                    { label: "Repos", value: dashboard.github.repos },
                    { label: "Followers", value: dashboard.github.followers },
                    { label: "Following", value: dashboard.github.following },
                  ].map((item) => (
                    <Box
                      key={item.label}
                      sx={{
                        textAlign: "center",
                        minWidth: 0,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                      }}
                    >
                        <Typography variant="h5" color="primary.main" sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                          {item.value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {dashboard.codeforces && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                  Codeforces
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Rating", value: dashboard.codeforces.rating ?? "—" },
                    { label: "Max Rating", value: dashboard.codeforces.max_rating ?? "—" },
                    { label: "Rank", value: dashboard.codeforces.rank ?? "—" },
                    { label: "Max Rank", value: dashboard.codeforces.max_rank ?? "—" },
                  ].map((item) => (
                    <Grid size={6} key={item.label}>
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
                        {item.value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: "block" }}>
            Activity Heatmap
          </Typography>
          <Heatmap data={dashboard.heatmap} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: "block" }}>
            Recent Activity (30 days)
          </Typography>
          <ActivityChart data={dashboard.recent_activity} />
          <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 2 }}>
            {[
              { label: "LeetCode", color: "warning.main" },
              { label: "Codeforces", color: "info.main" },
              { label: "GitHub", color: "secondary.main" },
            ].map((item) => (
              <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color }} />
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
