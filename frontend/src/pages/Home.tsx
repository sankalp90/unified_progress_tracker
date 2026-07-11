import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoGraphIcon from "@mui/icons-material/AutoGraph";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HubIcon from "@mui/icons-material/Hub";
import LoginIcon from "@mui/icons-material/Login";
import PublicIcon from "@mui/icons-material/Public";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import SettingsIcon from "@mui/icons-material/Settings";
import ShareIcon from "@mui/icons-material/Share";
import SyncIcon from "@mui/icons-material/Sync";
import { useUser } from "../hooks/useUser";
import PlatformBadge from "../components/PlatformBadge";

const modules = [
  { label: "Dashboard", icon: AutoGraphIcon, color: "#00a676" },
  { label: "Sync", icon: SyncIcon, color: "#1976d2" },
  { label: "Heatmap", icon: CalendarMonthIcon, color: "#ef6c00" },
  { label: "Profile", icon: PublicIcon, color: "#7b1fa2" },
  { label: "Setup", icon: SettingsIcon, color: "#455a64" },
  { label: "Rankings", icon: EmojiEventsIcon, color: "#c77700" },
];

const principles = [
  {
    title: "Clear before clever",
    text: "Every screen exists to answer one question: what changed, where, and what should happen next.",
  },
  {
    title: "Platforms stay connected",
    text: "LeetCode, Codeforces, and GitHub sit inside one workflow without losing their individual identity.",
  },
  {
    title: "Progress becomes presentable",
    text: "Private review and public proof live side by side, so effort can be understood quickly.",
  },
];

const flows = [
  { title: "Sign in", icon: LoginIcon },
  { title: "Link profiles", icon: HubIcon },
  { title: "Sync activity", icon: SyncIcon },
  { title: "Share profile", icon: ShareIcon },
];

export default function Home() {
  const { activeUser } = useUser();
  const primaryAction = activeUser
    ? { to: "/dashboard", label: "Open dashboard", icon: <AutoGraphIcon /> }
    : { to: "/signup", label: "Start tracking", icon: <RocketLaunchIcon /> };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 6, md: 8 } }}>
      <Box
        component="section"
        sx={{
          mx: { xs: -2, sm: -3 },
          mt: { xs: -4, sm: -4 },
          px: { xs: 2, sm: 3, md: 6 },
          py: { xs: 6, md: 8 },
          color: "#ffffff",
          bgcolor: "#151515",
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "linear-gradient(to bottom, black, transparent 88%)",
          },
        }}
      >
        <Grid container spacing={{ xs: 5, lg: 7 }} sx={{ position: "relative", alignItems: "center" }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Chip
              label="Unified Progress Tracker"
              sx={{
                mb: 3,
                bgcolor: "rgba(255,255,255,0.1)",
                color: "inherit",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            />
            <Typography
              component="h1"
              sx={{
                maxWidth: 820,
                fontSize: { xs: 40, sm: 64, lg: 92 },
                lineHeight: 0.9,
                fontWeight: 900,
                letterSpacing: 0,
                overflowWrap: "anywhere",
              }}
            >
              Turn scattered coding work into one beautiful control room.
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mt: 3,
                maxWidth: 700,
                color: "rgba(255,255,255,0.72)",
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              Connect platforms, sync activity, track progress, climb rankings, and share your profile—all in one place.
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 4 }}>
              <Button
                component={Link}
                to={primaryAction.to}
                variant="contained"
                size="large"
                startIcon={primaryAction.icon}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: "#ffffff",
                  color: "#151515",
                  px: 3,
                  py: 1.25,
                  "&:hover": { bgcolor: "#f2f2f2" },
                }}
              >
                {primaryAction.label}
              </Button>
              <Button
                component={Link}
                to="/leaderboard"
                variant="outlined"
                size="large"
                startIcon={<EmojiEventsIcon />}
                sx={{
                  borderColor: "rgba(255,255,255,0.34)",
                  color: "#ffffff",
                  px: 3,
                  py: 1.25,
                  "&:hover": { borderColor: "#ffffff", bgcolor: "rgba(255,255,255,0.08)" },
                }}
              >
                View leaderboard
              </Button>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, lg: 6 }}>
            <Paper
              elevation={0}
              sx={{
                position: "relative",
                minHeight: { xs: 620, sm: 520 },
                borderRadius: 0,
                bgcolor: "#f6f1e8",
                color: "#151515",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 20,
                  border: "2px solid #151515",
                }}
              />
              <Typography
                sx={{
                  position: "absolute",
                  left: 36,
                  top: 34,
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: 0,
                }}
              >
                Product map
              </Typography>

              <Box
                sx={{
                  position: "absolute",
                  inset: { xs: 56, sm: 72 },
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 1.5,
                }}
              >
                {modules.map((item, index) => (
                  <Paper
                    key={item.label}
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 0,
                      border: "2px solid #151515",
                      bgcolor: index % 2 === 0 ? "#ffffff" : "#ffe6a7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      transform: { xs: "none", sm: index === 1 || index === 4 ? "translateY(18px)" : "none" },
                      transition: "transform 180ms ease, background-color 180ms ease",
                      "&:hover": {
                        transform: { xs: "translateY(-4px)", sm: index === 1 || index === 4 ? "translateY(10px)" : "translateY(-8px)" },
                        bgcolor: "#ffffff",
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        {item.label}
                      </Typography>
                      <Box sx={{ mt: 1, height: 4, width: 54, bgcolor: item.color }} />
                    </Box>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: item.color,
                        color: "#ffffff",
                      }}
                    >
                      <item.icon fontSize="small" />
                    </Box>
                  </Paper>
                ))}
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  right: 34,
                  bottom: 34,
                  px: 1.5,
                  py: 0.75,
                  bgcolor: "#151515",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                Build momentum
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box component="section">
        <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                minHeight: 340,
                p: { xs: 3, md: 5 },
                borderRadius: 0,
                bgcolor: "#00a676",
                color: "#071f17",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="overline" sx={{ fontWeight: 900 }}>
                Design principle
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
                Less dashboard noise. More signal.
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 420, lineHeight: 1.8 }}>
                The interface is built around progress review, platform sync,
                profile sharing, and leaderboard discovery.
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Grid container spacing={2}>
              {principles.map((item) => (
                <Grid size={{ xs: 12 }} key={item.title}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: { xs: 2.5, md: 3 },
                      borderRadius: 0,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "220px 1fr" },
                      gap: 2,
                      alignItems: "start",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {item.text}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Box component="section">
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 2, mb: 2, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Feature surface
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              Everything has a job.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <PlatformBadge platform="leetcode" />
            <PlatformBadge platform="codeforces" />
            <PlatformBadge platform="github" />
          </Box>
        </Box>

        <Grid container spacing={2}>
          {modules.slice(0, 4).map((item) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={item.label}>
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 0,
                  height: "100%",
                  minHeight: 190,
                  position: "relative",
                  overflow: "hidden",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 6,
                    bgcolor: item.color,
                  },
                }}
              >
                <Box sx={{ width: 48, height: 48, display: "grid", placeItems: "center", bgcolor: item.color, color: "#ffffff", mb: 2 }}>
                  <item.icon />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                  A dedicated surface in the app workflow, kept separate so each action feels clear.
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid component="section" container spacing={2}>
        {flows.map((step, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={step.title}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 0,
                bgcolor: index % 2 === 0 ? "#151515" : "#f6f1e8",
                color: index % 2 === 0 ? "#ffffff" : "#151515",
                minHeight: 180,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <step.icon />
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {step.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        component="section"
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 0,
          bgcolor: "#f6f1e8",
          border: "2px solid #151515",
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
            Open the app. Connect the work. Keep moving.
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
            The home page stays clean. The real progress lives inside the logged-in experience.
          </Typography>
        </Box>
        <Button
          component={Link}
          to={activeUser ? "/dashboard" : "/login"}
          variant="contained"
          size="large"
          startIcon={activeUser ? <AutoGraphIcon /> : <LoginIcon />}
          endIcon={<ArrowForwardIcon />}
          sx={{ flexShrink: 0 }}
        >
          {activeUser ? "Open dashboard" : "Login"}
        </Button>
      </Paper>
    </Box>
  );
}
