import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ErrorIcon from "@mui/icons-material/Error";

export default function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            py: 4,
            textAlign: "center",
          }}
        >
          <ErrorIcon color="error" sx={{ fontSize: 48 }} />
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
          {onRetry && (
            <Button variant="outlined" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
