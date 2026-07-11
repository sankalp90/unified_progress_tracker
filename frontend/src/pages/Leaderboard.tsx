import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Avatar from "@mui/material/Avatar";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import StarIcon from "@mui/icons-material/Star";
import { api } from "../api/client";
import type { LeaderboardEntry } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <WorkspacePremiumIcon sx={{ color: "warning.main" }} />;
  if (rank === 2) return <EmojiEventsIcon sx={{ color: "grey.500" }} />;
  if (rank === 3) return <StarIcon sx={{ color: "warning.dark" }} />;
  return (
    <Typography variant="body2" sx={{ fontWeight: 700 }} color="text.secondary">
      #{rank}
    </Typography>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getLeaderboard();
      setEntries(data.leaderboard);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading leaderboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={load} />;

  const top3 = entries.slice(0, 3);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ textAlign: "center" }}>
        <Chip
          icon={<EmojiEventsIcon />}
          label="Global Rankings"
          color="warning"
          variant="outlined"
          sx={{ mb: 1 }}
        />
        <Typography variant="h4" gutterBottom>
          Leaderboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ranked by unified score across all platforms
        </Typography>
      </Box>

      {entries.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No users on the leaderboard yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          {top3.length >= 1 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "flex-end" },
                justifyContent: "center",
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {top3[1] && (
                <Card sx={{ width: { xs: "100%", sm: 160 }, textAlign: "center" }}>
                  <CardContent>
                    <Avatar sx={{ mx: "auto", mb: 1, bgcolor: "grey.300" }}>
                      <EmojiEventsIcon />
                    </Avatar>
                    <Typography
                      component={Link}
                      to={`/profile/${top3[1].username}`}
                      variant="subtitle2"
                      noWrap
                      sx={{ textDecoration: "none", color: "text.primary", fontWeight: 700 }}
                    >
                      {top3[1].name}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {top3[1].score.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      2nd place
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Card
                sx={{
                  width: { xs: "100%", sm: 180 },
                  textAlign: "center",
                  border: 2,
                  borderColor: "warning.main",
                  boxShadow: 4,
                }}
              >
                <CardContent>
                  <Avatar sx={{ mx: "auto", mb: 1, width: 56, height: 56, bgcolor: "warning.light" }}>
                    <WorkspacePremiumIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Typography
                    component={Link}
                    to={`/profile/${top3[0].username}`}
                    variant="subtitle1"
                    noWrap
                    sx={{ textDecoration: "none", color: "text.primary", fontWeight: 700 }}
                  >
                    {top3[0].name}
                  </Typography>
                  <Typography variant="h5" color="warning.main" sx={{ fontWeight: 700 }}>
                    {top3[0].score.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="warning.main">
                    Champion
                  </Typography>
                </CardContent>
              </Card>

              {top3[2] && (
                <Card sx={{ width: { xs: "100%", sm: 160 }, textAlign: "center" }}>
                  <CardContent>
                    <Avatar sx={{ mx: "auto", mb: 1, bgcolor: "warning.dark" }}>
                      <StarIcon />
                    </Avatar>
                    <Typography
                      component={Link}
                      to={`/profile/${top3[2].username}`}
                      variant="subtitle2"
                      noWrap
                      sx={{ textDecoration: "none", color: "text.primary", fontWeight: 700 }}
                    >
                      {top3[2].name}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }} color="warning.dark">
                      {top3[2].score.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      3rd place
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      Solved
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      CF Rating
                    </TableCell>
                    <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      Achievements
                    </TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.user_id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32 }}>
                          <RankIcon rank={entry.rank} />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          component={Link}
                          to={`/profile/${entry.username}`}
                          sx={{ textDecoration: "none", color: "text.primary", fontWeight: 600, "&:hover": { color: "primary.main" } }}
                        >
                          {entry.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        {entry.solved}
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        {entry.codeforces_rating || "—"}
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        {entry.achievements}
                      </TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 700 }} color="primary.main">
                          {entry.score.toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </>
      )}
    </Box>
  );
}
