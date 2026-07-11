import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const platformConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  leetcode: { label: "LeetCode", color: "#ed6c02", bg: "#fff3e0" },
  codeforces: { label: "Codeforces", color: "#0288d1", bg: "#e1f5fe" },
  github: { label: "GitHub", color: "#7b1fa2", bg: "#f3e5f5" },
};

interface PlatformBadgeProps {
  platform: string;
  username?: string;
  verified?: boolean;
  size?: "sm" | "md";
}

export default function PlatformBadge({
  platform,
  username,
  verified,
  size = "md",
}: PlatformBadgeProps) {
  const config = platformConfig[platform.toLowerCase()] ?? {
    label: platform,
    color: "#616161",
    bg: "#f5f5f5",
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        maxWidth: "100%",
        minWidth: 0,
        px: size === "sm" ? 1 : 1.5,
        py: size === "sm" ? 0.5 : 1,
        borderRadius: 2,
        bgcolor: config.bg,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Chip
        label={config.label}
        size="small"
        sx={{
          height: size === "sm" ? 20 : 24,
          fontSize: size === "sm" ? "0.65rem" : "0.75rem",
          fontWeight: 700,
          bgcolor: `${config.color}22`,
          color: config.color,
        }}
      />
      {username && (
        <Typography
          variant={size === "sm" ? "caption" : "body2"}
          sx={{
            fontFamily: "monospace",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          color="text.primary"
        >
          {username}
        </Typography>
      )}
      {verified !== undefined && (
        <Chip
          label={verified ? "verified" : "unverified"}
          size="small"
          color={verified ? "success" : "default"}
          variant="outlined"
          sx={{ height: 20, fontSize: "0.65rem" }}
        />
      )}
    </Box>
  );
}

export function PlatformIcon({ platform }: { platform: string }) {
  const config = platformConfig[platform.toLowerCase()];
  return (
    <Box component="span" sx={{ color: config?.color ?? "#616161" }}>
      {config?.label ?? platform}
    </Box>
  );
}
