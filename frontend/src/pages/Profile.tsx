import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import PersonIcon from "@mui/icons-material/Person";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { api } from "../api/client";
import type { PublicProfile } from "../types";
import StatCard from "../components/StatCard";
import Heatmap from "../components/Heatmap";
import PlatformBadge from "../components/PlatformBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const load = async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getPublicProfile(username);
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Profile not found");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [username]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;
  if (!profile) return null;

  const { coding_stats: stats, streaks } = profile;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Card
        elevation={2}
        sx={{
          background: "linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { sm: "center" },
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: "primary.main",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                {profile.user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h4" sx={{ overflowWrap: "anywhere" }}>{profile.user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  @{profile.user.username}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Button
                onClick={handleCopyLink}
                variant="outlined"
                size="small"
                startIcon={copied ? <ContentCopyIcon /> : <ShareIcon />}
              >
                {copied ? "Copied!" : "Share Profile"}
              </Button>
              <Button
                component={Link}
                to="/leaderboard"
                variant="outlined"
                size="small"
                startIcon={<OpenInNewIcon />}
              >
                Leaderboard
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Unified Score" value={profile.score.toLocaleString()} icon={MilitaryTechIcon} color="#1976d2" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Problems Solved" value={stats.solved} icon={TrackChangesIcon} color="#0288d1" subtitle={`E:${stats.easy} M:${stats.medium} H:${stats.hard}`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Current Streak" value={`${streaks.current_streak}d`} icon={LocalFireDepartmentIcon} color="#d32f2f" subtitle={`Best: ${streaks.longest_streak} days`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Achievements" value={profile.achievement_count} icon={EmojiEventsIcon} color="#ed6c02" />
        </Grid>
      </Grid>

      {profile.profiles.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <PersonIcon fontSize="small" />
              Linked Platforms
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              {profile.profiles.map((p) => (
                <PlatformBadge key={p.platform} platform={p.platform} username={p.username} verified={p.verified} />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2}>
        {profile.github && (
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
                    { label: "Repos", value: profile.github.repos },
                    { label: "Followers", value: profile.github.followers },
                    { label: "Following", value: profile.github.following },
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

        {profile.codeforces && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                  Codeforces
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { label: "Rating", value: profile.codeforces.rating ?? "—" },
                    { label: "Max Rating", value: profile.codeforces.max_rating ?? "—" },
                    { label: "Rank", value: profile.codeforces.rank ?? "—" },
                    { label: "Max Rank", value: profile.codeforces.max_rank ?? "—" },
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
          <Heatmap data={profile.heatmap} />
        </CardContent>
      </Card>

      {profile.achievements.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="overline" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <EmojiEventsIcon fontSize="small" />
              Achievements ({profile.achievement_count})
            </Typography>
            <Grid container spacing={2}>
              {profile.achievements.map((a, i) => (
                <Grid size={{ xs: 12, sm: 6 }} key={`${a.title}-${i}`}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: "flex", gap: 2, minWidth: 0 }}>
                      <Avatar sx={{ bgcolor: "warning.light", color: "warning.dark", flexShrink: 0 }}>
                        <EmojiEventsIcon />
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {a.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                          {a.description}
                        </Typography>
                        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                          <PlatformBadge platform={a.platform} size="sm" />
                          <Typography variant="caption" color="text.disabled">
                            {new Date(a.achieved_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
