import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RecentActivityEntry } from "../types";

interface ActivityChartProps {
  data: RecentActivityEntry[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const theme = useTheme();

  if (!data.length) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 256,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No recent activity. Sync history to populate this chart.
        </Typography>
      </Box>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  const leetcodeColor = theme.palette.warning.main;
  const codeforcesColor = theme.palette.info.main;
  const githubColor = theme.palette.secondary.main;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="leetcodeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={leetcodeColor} stopOpacity={0.4} />
            <stop offset="100%" stopColor={leetcodeColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={codeforcesColor} stopOpacity={0.4} />
            <stop offset="100%" stopColor={codeforcesColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="ghGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={githubColor} stopOpacity={0.4} />
            <stop offset="100%" stopColor={githubColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
        <XAxis
          dataKey="label"
          tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            fontSize: "12px",
            boxShadow: theme.shadows[2],
          }}
        />
        <Area
          type="monotone"
          dataKey="leetcode"
          stackId="1"
          stroke={leetcodeColor}
          fill="url(#leetcodeGrad)"
          name="LeetCode"
        />
        <Area
          type="monotone"
          dataKey="codeforces"
          stackId="1"
          stroke={codeforcesColor}
          fill="url(#cfGrad)"
          name="Codeforces"
        />
        <Area
          type="monotone"
          dataKey="github"
          stackId="1"
          stroke={githubColor}
          fill="url(#ghGrad)"
          name="GitHub"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
