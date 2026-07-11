import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import LinkIcon from "@mui/icons-material/Link";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SyncIcon from "@mui/icons-material/Sync";
import { api } from "../api/client";
import { useUser } from "../hooks/useUser";
import type { PlatformProfile } from "../types";
import PlatformBadge from "../components/PlatformBadge";
import UserSelector from "../components/UserSelector";

export default function Setup() {
  const { activeUser } = useUser();
  const [profiles, setProfiles] = useState<PlatformProfile[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    platform: "leetcode",
    username: "",
  });

  const loadProfiles = async () => {
    if (!activeUser) {
      setProfiles([]);
      return;
    }
    try {
      const data = await api.getUserProfiles(activeUser.id);
      setProfiles(data);
    } catch {
      setProfiles([]);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [activeUser?.id]);

  const handleLinkProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUser) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.createProfile({
        platform: profileForm.platform,
        user_id: activeUser.id,
        username: profileForm.username,
        verified: true,
      });
      setProfileForm({ platform: "leetcode", username: "" });
      await loadProfiles();
      setMessage(`${profileForm.platform} profile linked!`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to link profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async (id: number) => {
    try {
      await api.deleteProfile(id);
      await loadProfiles();
      setMessage("Profile removed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete profile");
    }
  };

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Setup
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Link coding platform profiles for your logged-in account.
        </Typography>
      </Box>

      {(message || error) && (
        <Alert severity={error ? "error" : "success"} onClose={() => { setMessage(""); setError(""); }}>
          {error || message}
        </Alert>
      )}

      <UserSelector />

      {activeUser && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <LinkIcon color="info" />
              Link Platform
            </Typography>
            <Box component="form" onSubmit={handleLinkProfile} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Platform</InputLabel>
                    <Select
                      label="Platform"
                      value={profileForm.platform}
                      onChange={(e) => setProfileForm({ ...profileForm, platform: e.target.value })}
                    >
                      <MenuItem value="leetcode">LeetCode</MenuItem>
                      <MenuItem value="codeforces">Codeforces</MenuItem>
                      <MenuItem value="github">GitHub</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    label="Platform Username"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    required
                    placeholder="your_handle"
                  />
                </Grid>
              </Grid>
              <Box>
                <Button type="submit" variant="contained" disabled={loading} startIcon={<LinkIcon />}>
                  Link Profile
                </Button>
              </Box>
            </Box>

            {profiles.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="overline" color="text.secondary" sx={{ mb: 2, display: "block" }}>
                  Linked Profiles
                </Typography>
                {profiles.map((p, i) => (
                  <Box key={p.id}>
                    {i > 0 && <Divider sx={{ my: 1.5 }} />}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "stretch", sm: "center" },
                        justifyContent: "space-between",
                        gap: 2,
                        minWidth: 0,
                      }}
                    >
                      <PlatformBadge platform={p.platform} username={p.username} verified={p.verified} />
                      <IconButton
                        onClick={() => handleDeleteProfile(p.id)}
                        color="error"
                        size="small"
                        aria-label="Delete profile"
                        sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {activeUser && profiles.length > 0 && (
        <Card>
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Ready to sync!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Head to the Sync page to pull your latest stats.
              </Typography>
            </Box>
            <Button component={Link} to="/sync" variant="contained" startIcon={<SyncIcon />}>
              Sync Now
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
