<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import type { AggregatedData } from '$lib/utils';
  import { formatCurrency, formatDate } from '$lib/utils';

  Chart.register(...registerables);

  interface Props {
    data: AggregatedData[];
    title?: string;
    height?: number;
  }

  let { data, title = 'Investment Value', height = 300 }: Props = $props();
  
  // Sample data for performance if there are too many points
  function sampleData(data: AggregatedData[], maxPoints = 100): AggregatedData[] {
    if (data.length <= maxPoints) return data;
    
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  }
  
  let chartData = $derived(sampleData(data || []));

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  onMount(() => {
    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  });



  $effect(() => {
    if (canvas && chartData.length > 0) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (chart) {
          updateChart();
        } else {
          createChart();
        }
      }, 100);
    }
  });

  function createChart() {
    if (!canvas) {
      console.error('Canvas not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Canvas context not available');
      return;
    }

    try {
      chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.map(d => formatDate(d.date)),
        datasets: [{
          label: 'Portfolio Value',
          data: chartData.map(d => d.value),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.1,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#3b82f6',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                const dataPoint = chartData[context.dataIndex];
                const change = dataPoint.change || 0;
                const changePercent = dataPoint.changePercent || 0;
                
                let label = `Value: ${formatCurrency(value)}`;
                if (change !== 0) {
                  const changeText = change > 0 ? '+' : '';
                  label += `\nChange: ${changeText}${formatCurrency(change)} (${changePercent.toFixed(2)}%)`;
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxTicksLimit: 8
            }
          },
          y: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return formatCurrency(Number(value));
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }

  function updateChart() {
    if (!chart) return;

    chart.data.labels = chartData.map(d => formatDate(d.date));
    chart.data.datasets[0].data = chartData.map(d => d.value);
    chart.update('none');
  }
</script>

<div class="card">
  <h3 class="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
  <div style="height: {height}px;">
    <canvas bind:this={canvas}></canvas>
  </div>
</div>