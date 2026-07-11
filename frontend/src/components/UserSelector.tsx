import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LoginIcon from "@mui/icons-material/Login";
import { useUser } from "../hooks/useUser";

export default function UserSelector() {
  const { activeUser, loading } = useUser();

  if (loading) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: "block" }}>
          Active User
        </Typography>
        {activeUser ? (
          <Box>
            <Typography variant="subtitle2">{activeUser.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              @{activeUser.username}
            </Typography>
          </Box>
        ) : (
          <Button component={Link} to="/login" variant="contained" size="small" startIcon={<LoginIcon />}>
            Login
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
