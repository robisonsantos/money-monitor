import { parseISO, format, startOfMonth, startOfWeek } from "date-fns";
import { c as sanitizeCSVValue } from "./sanitize.js";
function filterByPeriod(data, period, filter) {
  if (filter === "all" || data.length === 0) return data;
  const now = /* @__PURE__ */ new Date();
  const cutoffMap = {
    // Daily filters
    "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3),
    "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3),
    "60d": new Date(now.getTime() - 60 * 24 * 60 * 60 * 1e3),
    // Weekly filters (assuming weeks start on Monday)
    "4w": new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1e3),
    "12w": new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1e3),
    "24w": new Date(now.getTime() - 24 * 7 * 24 * 60 * 60 * 1e3),
    // Monthly filters (approximate)
    "3m": new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1e3),
    "6m": new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1e3),
    "12m": new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1e3)
  };
  const cutoff = cutoffMap[filter];
  if (!cutoff) return data;
  return data.filter((item) => parseISO(item.date) >= cutoff);
}
function aggregateInvestments(investments, period, filter = "all") {
  if (investments.length === 0) return [];
  const sortedInvestments = [...investments].sort((a, b) => a.date.localeCompare(b.date));
  let aggregated;
  switch (period) {
    case "daily":
      aggregated = sortedInvestments.map((investment, index) => {
        const prevInvestment = index > 0 ? sortedInvestments[index - 1] : null;
        const change = prevInvestment ? investment.value - prevInvestment.value : 0;
        const changePercent = prevInvestment ? change / prevInvestment.value * 100 : 0;
        return {
          date: investment.date,
          value: investment.value,
          change,
          changePercent
        };
      });
      break;
    case "weekly":
      aggregated = aggregateByPeriod(
        sortedInvestments,
        (date) => format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), "yyyy-MM-dd")
      );
      break;
    case "monthly":
      aggregated = aggregateByPeriod(
        sortedInvestments,
        (date) => format(startOfMonth(parseISO(date)), "yyyy-MM-dd")
      );
      break;
    default:
      aggregated = [];
  }
  return filterByPeriod(aggregated, period, filter);
}
function aggregateByPeriod(investments, getPeriodKey) {
  const periodMap = /* @__PURE__ */ new Map();
  investments.forEach((investment) => {
    const periodKey = getPeriodKey(investment.date);
    if (!periodMap.has(periodKey)) {
      periodMap.set(periodKey, []);
    }
    periodMap.get(periodKey).push(investment);
  });
  const aggregated = [];
  const sortedPeriods = Array.from(periodMap.keys()).sort();
  sortedPeriods.forEach((periodKey, index) => {
    const periodInvestments = periodMap.get(periodKey);
    const lastInvestment = periodInvestments[periodInvestments.length - 1];
    const prevPeriod = index > 0 ? aggregated[index - 1] : null;
    const change = prevPeriod ? lastInvestment.value - prevPeriod.value : 0;
    const changePercent = prevPeriod ? change / prevPeriod.value * 100 : 0;
    aggregated.push({
      date: periodKey,
      value: lastInvestment.value,
      change,
      changePercent
    });
  });
  return aggregated;
}
function calculateFilteredPortfolioStats(aggregatedData) {
  if (aggregatedData.length === 0) {
    return {
      totalValue: 0,
      totalChange: 0,
      totalChangePercent: 0,
      bestDay: null,
      worstDay: null,
      totalDays: 0
    };
  }
  const firstEntry = aggregatedData[0];
  const lastEntry = aggregatedData[aggregatedData.length - 1];
  const totalValue = lastEntry.value;
  const totalChange = totalValue - firstEntry.value;
  const totalChangePercent = firstEntry.value !== 0 ? totalChange / firstEntry.value * 100 : 0;
  let bestDay = null;
  let worstDay = null;
  for (const entry of aggregatedData) {
    if (entry.change !== void 0 && entry.changePercent !== void 0) {
      if (!bestDay || entry.changePercent > bestDay.changePercent) {
        bestDay = {
          date: entry.date,
          change: entry.change,
          changePercent: entry.changePercent
        };
      }
      if (!worstDay || entry.changePercent < worstDay.changePercent) {
        worstDay = {
          date: entry.date,
          change: entry.change,
          changePercent: entry.changePercent
        };
      }
    }
  }
  return {
    totalValue,
    totalChange,
    totalChangePercent,
    bestDay,
    worstDay,
    totalDays: aggregatedData.length
  };
}
function parseCSV(csvContent) {
  const lines = csvContent.trim().split("\n");
  const errors = [];
  const data = [];
  if (lines.length === 0) {
    return { isValid: false, data: [], errors: ["CSV file is empty"] };
  }
  let startIndex = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes("date") && firstLine.includes("value")) {
    startIndex = 1;
  }
  if (lines.length === startIndex) {
    return { isValid: false, data: [], errors: ["CSV file has no data rows"] };
  }
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const columns = line.split(",").map((col) => col.trim().replace(/"/g, ""));
    if (columns.length !== 2) {
      errors.push(`Row ${i + 1}: Expected 2 columns (date, value), got ${columns.length}`);
      continue;
    }
    const [dateStr, valueStr] = columns;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      errors.push(`Row ${i + 1}: Invalid date format "${dateStr}". Expected YYYY-MM-DD`);
      continue;
    }
    try {
      const parsedDate = parseISO(dateStr);
      if (isNaN(parsedDate.getTime())) {
        errors.push(`Row ${i + 1}: Invalid date "${dateStr}"`);
        continue;
      }
    } catch {
      errors.push(`Row ${i + 1}: Invalid date "${dateStr}"`);
      continue;
    }
    const value = parseFloat(valueStr);
    if (isNaN(value) || value < 0) {
      errors.push(`Row ${i + 1}: Invalid value "${valueStr}". Must be a positive number`);
      continue;
    }
    data.push({ date: dateStr, value });
  }
  return {
    isValid: errors.length === 0,
    data,
    errors
  };
}
function generateCSV(investments) {
  const header = "Date,Value\n";
  const rows = investments.map(
    (inv) => `${sanitizeCSVValue(inv.date)},${sanitizeCSVValue(inv.value.toString())}`
  ).join("\n");
  return header + rows;
}
export {
  aggregateInvestments as a,
  calculateFilteredPortfolioStats as c,
  generateCSV as g,
  parseCSV as p
};
