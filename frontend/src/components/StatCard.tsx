import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: SvgIconComponent;
  color: string;
  subtitle?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  color,
  subtitle,
}: StatCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, minWidth: 0 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary">
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mt: 0.5,
                fontWeight: 500,
                overflowWrap: "anywhere",
                fontSize: { xs: "1.65rem", sm: "2rem" },
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: `${color}18`,
            }}
          >
            <Icon sx={{ color, fontSize: 24 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
