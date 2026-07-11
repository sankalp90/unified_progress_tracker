import { NavLink, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import BoltIcon from "@mui/icons-material/Bolt";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import SyncIcon from "@mui/icons-material/Sync";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useUser } from "../hooks/useUser";

export default function Navbar() {
  const { activeUser, setActiveUser } = useUser();
  const location = useLocation();

  const links = [
    { to: "/", activePath: "/", icon: HomeIcon, label: "Home" },
    { to: "/dashboard", activePath: "/dashboard", icon: DashboardIcon, label: "Dashboard" },
    { to: "/leaderboard", activePath: "/leaderboard", icon: EmojiEventsIcon, label: "Leaderboard" },
    { to: "/sync", activePath: "/sync", icon: SyncIcon, label: "Sync" },
    {
      to: activeUser ? `/profile/${activeUser.username}` : "/login",
      activePath: "/profile",
      icon: PersonIcon,
      label: "Profile",
    },
    { to: "/setup", activePath: "/setup", icon: SettingsIcon, label: "Setup" },
  ];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 }, overflow: "hidden" }}>
        <Box
          component={NavLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textDecoration: "none",
            color: "inherit",
            mr: { xs: 0, sm: 1 },
            flexShrink: 0,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.dark",
            }}
          >
            <BoltIcon fontSize="small" />
          </Avatar>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Unified Progress
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 1 }}>
              TRACKER
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            flex: 1,
            minWidth: 0,
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {links.map(({ to, activePath, icon: Icon, label }) => {
            const active = isActive(activePath);
            return (
              <Button
                key={label}
                component={NavLink}
                to={to}
                end={activePath === "/"}
                color="inherit"
                startIcon={<Icon fontSize="small" />}
                sx={{
                  px: { xs: 1, md: 2 },
                  minWidth: { xs: 40, md: 64 },
                  flexShrink: 0,
                  bgcolor: active ? "rgba(255,255,255,0.15)" : "transparent",
                  "&:hover": {
                    bgcolor: active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)",
                  },
                }}
              >
                <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
                  {label}
                </Box>
              </Button>
            );
          })}
        </Box>

        {activeUser ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
            <Chip
              component={NavLink}
              to={`/profile/${activeUser.username}`}
              avatar={
                <Avatar sx={{ bgcolor: "primary.dark", width: 28, height: 28 }}>
                  {activeUser.name.charAt(0).toUpperCase()}
                </Avatar>
              }
              label={
                <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "left" }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: "block", lineHeight: 1.2 }}>
                    {activeUser.name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8, display: "block" }}>
                    @{activeUser.username}
                  </Typography>
                </Box>
              }
              clickable
              sx={{
                height: "auto",
                py: 0.5,
                bgcolor: "rgba(255,255,255,0.12)",
                color: "inherit",
                "& .MuiChip-label": { px: 1 },
              }}
            />
            <Button
              onClick={() => setActiveUser(null)}
              aria-label="Logout"
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<LogoutIcon />}
              sx={{ borderColor: "rgba(255,255,255,0.5)", minWidth: { xs: 40, sm: 64 }, px: { xs: 1, sm: 2 } }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Logout
              </Box>
            </Button>
          </Box>
        ) : (
          <Button
            component={NavLink}
            to="/login"
            aria-label="Login"
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<LoginIcon />}
            sx={{ borderColor: "rgba(255,255,255,0.5)", flexShrink: 0, minWidth: { xs: 40, sm: 64 }, px: { xs: 1, sm: 2 } }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Login
            </Box>
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
