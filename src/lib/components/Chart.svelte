<script lang="ts">
  import { onMount } from "svelte";
  import { Chart, registerables } from "chart.js";
  import type { AggregatedData } from "$lib/utils";
  import { formatCurrency, formatDate } from "$lib/utils";
  import { themeStore } from "$lib/stores/theme";

  Chart.register(...registerables);

  interface Props {
    data: AggregatedData[];
    title?: string;
    height?: number;
  }

  let { data, title = "Investment Value", height = 300 }: Props = $props();

  // Sample data for performance if there are too many points
  function sampleData(data: AggregatedData[], maxPoints = 100): AggregatedData[] {
    if (data.length <= maxPoints) return data;

    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  }

  let chartData = $derived(sampleData(data || []));

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  // Get theme-aware colors
  function getThemeColors() {
    // Check if we're in browser and can access computed styles
    if (typeof window === "undefined") {
      return getDefaultColors(false);
    }

    // Check the actual applied theme by looking at the document class
    const isDark = document.documentElement.classList.contains("dark");

    return getDefaultColors(isDark);
  }

  function getDefaultColors(isDark: boolean) {
    return {
      // Text colors using RGBA format
      textColor: isDark ? "rgba(226, 232, 240, 1)" : "rgba(51, 65, 85, 1)", // slate-200 : slate-700
      textColorSecondary: isDark ? "rgba(226, 232, 240, 1)" : "rgba(100, 116, 139, 1)", // slate-200 : slate-500

      // Grid colors
      gridColor: isDark ? "rgba(148, 163, 184, 0.4)" : "rgba(0, 0, 0, 0.1)", // more visible grid

      // Chart colors
      borderColor: isDark ? "rgba(59, 130, 246, 1)" : "rgba(37, 99, 235, 1)", // blue-500 : blue-600
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(37, 99, 235, 0.1)",
      pointBackgroundColor: isDark ? "rgba(59, 130, 246, 1)" : "rgba(37, 99, 235, 1)",
      pointBorderColor: isDark ? "rgba(15, 23, 42, 1)" : "rgba(255, 255, 255, 1)", // slate-900 : white

      // Tooltip colors
      tooltipBackground: isDark ? "rgba(30, 41, 59, 0.95)" : "rgba(0, 0, 0, 0.8)", // slate-800 : black
      tooltipBorder: isDark ? "rgba(59, 130, 246, 1)" : "rgba(37, 99, 235, 1)",
    };
  }

  onMount(() => {
    // Set Chart.js global defaults for better theme support
    setChartDefaults();

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  });

  // Separate effect for theme changes
  $effect(() => {
    const currentTheme = $themeStore.resolvedTheme;

    // Set global defaults when theme changes
    setChartDefaults();

    if (chart) {
      updateChartTheme();
    }
  });

  // Separate effect for data changes
  $effect(() => {
    if (canvas && chartData.length > 0) {
      if (chart) {
        // Update existing chart with new data
        updateChart();
      } else {
        // Create new chart
        createChart();
      }
    }
  });

  function setChartDefaults() {
    const colors = getThemeColors();

    // Set only basic Chart.js global defaults
    Chart.defaults.color = colors.textColorSecondary;
    Chart.defaults.borderColor = colors.gridColor;
    Chart.defaults.backgroundColor = colors.backgroundColor;
  }

  function createChart() {
    if (!canvas) {
      return;
    }

    // Destroy any existing chart
    if (chart) {
      chart.destroy();
      chart = null;
    }

    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const colors = getThemeColors();

    const chartConfig = {
      type: "line",
      data: {
        labels: chartData.map((d) => formatDate(d.date)),
        datasets: [
          {
            label: "Portfolio Value",
            data: chartData.map((d) => d.value),
            borderColor: colors.borderColor,
            backgroundColor: colors.backgroundColor,
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointBackgroundColor: colors.pointBackgroundColor,
            pointBorderColor: colors.pointBorderColor,
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        color: colors.textColorSecondary, // Global color setting
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: colors.tooltipBackground,
            titleColor: colors.textColor,
            bodyColor: colors.textColor,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                const dataPoint = chartData[context.dataIndex];
                const change = dataPoint.change || 0;
                const changePercent = dataPoint.changePercent || 0;

                let label = `Value: ${formatCurrency(value)}`;
                if (change !== 0) {
                  const changeText = change > 0 ? "+" : "";
                  label += `\nChange: ${changeText}${formatCurrency(change)} (${changePercent.toFixed(2)}%)`;
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: true,
              color: colors.gridColor,
            },
            ticks: {
              maxTicksLimit: 8,
              color: colors.textColorSecondary,
              font: {
                size: 12,
              },
            },
          },
          y: {
            grid: {
              color: colors.gridColor,
            },
            ticks: {
              color: colors.textColorSecondary,
              font: {
                size: 12,
              },
              callback: function (value) {
                return formatCurrency(Number(value));
              },
            },
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
      },
    };

    try {
      chart = new Chart(ctx, chartConfig);
    } catch (error) {
      console.error("Error creating chart:", error);
    }
  }

  function updateChartTheme() {
    if (!chart) return;

    const colors = getThemeColors();

    // Update scale colors directly
    if (chart.options.scales?.x?.ticks) {
      chart.options.scales.x.ticks.color = colors.textColorSecondary;
    }
    if (chart.options.scales?.y?.ticks) {
      chart.options.scales.y.ticks.color = colors.textColorSecondary;
    }
    if (chart.options.scales?.x?.grid) {
      chart.options.scales.x.grid.color = colors.gridColor;
    }
    if (chart.options.scales?.y?.grid) {
      chart.options.scales.y.grid.color = colors.gridColor;
    }

    // Update dataset colors
    chart.data.datasets[0].borderColor = colors.borderColor;
    chart.data.datasets[0].backgroundColor = colors.backgroundColor;
    chart.data.datasets[0].pointBackgroundColor = colors.pointBackgroundColor;
    chart.data.datasets[0].pointBorderColor = colors.pointBorderColor;

    // Update global color
    if (chart.options) {
      chart.options.color = colors.textColorSecondary;
    }

    // Force update
    chart.update("none");
  }

  function updateChart() {
    if (!chart) return;

    const colors = getThemeColors();

    // Update data
    chart.data.labels = chartData.map((d) => formatDate(d.date));
    chart.data.datasets[0].data = chartData.map((d) => d.value);

    // Update theme colors
    chart.data.datasets[0].borderColor = colors.borderColor;
    chart.data.datasets[0].backgroundColor = colors.backgroundColor;
    chart.data.datasets[0].pointBackgroundColor = colors.pointBackgroundColor;
    chart.data.datasets[0].pointBorderColor = colors.pointBorderColor;

    // Force full update to apply all changes
    chart.update("active");
  }
</script>

<div class="card">
  <h3 class="text-lg font-semibold text-foreground-primary mb-4">{title}</h3>
  <div style="height: {height}px;" class="theme-aware-chart chart-container">
    <canvas bind:this={canvas}></canvas>
  </div>
</div>

<style>
  .theme-aware-chart {
    /* Ensure theme colors are inherited */
    color: rgb(var(--color-foreground-primary));
    /* Force canvas text color inheritance */
    --chartjs-color: rgb(var(--color-foreground-secondary));
  }

  /* Force Chart.js text colors using CSS variables */
  :global(.chart-container) {
    --chart-text-color: rgb(var(--color-foreground-secondary));
    --chart-grid-color: rgba(var(--color-border-primary), 0.3);
  }

  /* Dark mode Chart.js overrides */
  :global(.dark .chart-container) {
    --chart-text-color: rgba(148, 163, 184, 1);
    --chart-grid-color: rgba(148, 163, 184, 0.3);
  }

  /* Try to override Chart.js internal styles */
  :global(.chart-container canvas) {
    color: var(--chart-text-color) !important;
  }

  /* Force Chart.js tick colors */
  :global(.chartjs-render-monitor) {
    color: var(--chart-text-color) !important;
  }
</style>
