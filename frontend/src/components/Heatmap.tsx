import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { HeatmapEntry } from "../types";

interface HeatmapProps {
  data: HeatmapEntry[];
}

interface HeatmapDay extends HeatmapEntry {
  inRange: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getIntensityColor(count: number, max: number, theme: Theme) {
  if (count === 0) return theme.palette.mode === "dark" ? "#2d333b" : "#ebedf0";
  const ratio = Math.min(count / Math.max(max, 1), 1);
  if (ratio <= 0.25) return "#9be9a8";
  if (ratio <= 0.5) return "#40c463";
  if (ratio <= 0.75) return "#30a14e";
  return "#216e39";
}

export default function Heatmap({ data }: HeatmapProps) {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = useMemo(() => {
    const activityYears = data.map((entry) => parseDateKey(entry.date).getFullYear());
    return Array.from(new Set([currentYear, ...activityYears])).sort((a, b) => b - a);
  }, [currentYear, data]);

  const activityByDate = useMemo(
    () => new Map(data.map((entry) => [entry.date, entry.count])),
    [data]
  );

  const yearStart = new Date(selectedYear, 0, 1);
  const yearEnd = new Date(selectedYear, 11, 31);
  const gridStart = new Date(yearStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const gridEnd = new Date(yearEnd);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay()));
  const weekCount = Math.ceil((gridEnd.getTime() - gridStart.getTime() + DAY_MS) / (7 * DAY_MS));

  const weeks: HeatmapDay[][] = Array.from({ length: weekCount }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(gridStart.getTime() + (weekIndex * 7 + dayIndex) * DAY_MS);
      const dateKey = toDateKey(date);
      const inRange = date >= yearStart && date <= yearEnd;
      return {
        date: dateKey,
        count: inRange ? activityByDate.get(dateKey) ?? 0 : 0,
        inRange,
      };
    })
  );

  const max = Math.max(...weeks.flat().map((entry) => entry.count), 1);
  const monthMarkers = weeks.map((week, index) => {
    const monthStart = week.find((day) => {
      if (!day.inRange) return false;
      const date = parseDateKey(day.date);
      return date.getDate() <= 7;
    });
    if (!monthStart) return "";
    const month = parseDateKey(monthStart.date).getMonth();
    const previousMonth = index > 0
      ? weeks
          .slice(0, index)
          .flat()
          .filter((day) => day.inRange)
          .map((day) => parseDateKey(day.date).getMonth())
          .pop()
      : undefined;
    return month !== previousMonth ? MONTH_LABELS[month] : "";
  });
  const selectedYearTotal = weeks.flat().reduce((total, entry) => total + entry.count, 0);

  return (
    <Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.5 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {selectedYearTotal} activities in {selectedYear}
            </Typography>
            {data.length === 0 && (
              <Typography variant="caption" color="text.secondary">
                Sync your platforms to fill this in.
              </Typography>
            )}
          </Box>

          <FormControl size="small" sx={{ minWidth: 104 }}>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              displayEmpty
              sx={{ bgcolor: "background.paper" }}
            >
              {years.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ overflowX: "auto", pb: 1 }}>
          <Box sx={{ display: "inline-grid", gridTemplateColumns: "32px auto", gap: 1 }}>
          <Box />
          <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${weeks.length}, 14px)`, gap: 0.5, mb: 0.75 }}>
            {monthMarkers.map((label, index) => (
              <Typography key={`${label}-${index}`} variant="caption" color="text.secondary" sx={{ lineHeight: "14px", minWidth: 28 }}>
                {label}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateRows: "repeat(7, 14px)", gap: 0.5 }}>
            {WEEKDAY_LABELS.map((label, index) => (
              <Typography key={`${label}-${index}`} variant="caption" color="text.secondary" sx={{ lineHeight: "14px", fontSize: 10 }}>
                {label}
              </Typography>
            ))}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${weeks.length}, 14px)`, gridTemplateRows: "repeat(7, 14px)", gridAutoFlow: "column", gap: 0.5 }}>
            {weeks.map((week, wi) =>
              week.map((entry, di) => {
                const color = entry.inRange
                  ? getIntensityColor(entry.count, max, theme)
                  : "transparent";
                const cell = (
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: 0.5,
                      bgcolor: color,
                      border: entry.inRange ? `1px solid ${theme.palette.divider}` : "1px solid transparent",
                      transition: "transform 0.15s, outline-color 0.15s",
                      "&:hover": entry.inRange
                        ? { transform: "scale(1.18)", outline: `1px solid ${theme.palette.text.secondary}`, zIndex: 1 }
                        : undefined,
                    }}
                  />
                );

                return entry.inRange ? (
                  <Tooltip key={`${wi}-${di}`} title={`${entry.date}: ${entry.count} activities`} arrow>
                    {cell}
                  </Tooltip>
                ) : (
                  <Box key={`${wi}-${di}`}>{cell}</Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>

        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            Less
          </Typography>
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <Box
              key={r}
              sx={{
                width: 12,
                height: 12,
                borderRadius: 0.5,
                bgcolor: getIntensityColor(r * max, max, theme),
              }}
            />
          ))}
          <Typography variant="caption" color="text.secondary">
            More
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
