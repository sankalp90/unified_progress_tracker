import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

export default function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 10,
      }}
    >
      <CircularProgress color="primary" />
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
}
