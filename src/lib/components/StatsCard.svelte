<script lang="ts">
  import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-svelte';
  import { formatCurrency, formatPercent } from '$lib/utils';

  interface Props {
    title: string;
    value: string | number;
    change?: number;
    changePercent?: number;
    icon?: 'dollar' | 'calendar' | 'trending-up' | 'trending-down';
    showChange?: boolean;
  }

  let { 
    title, 
    value, 
    change, 
    changePercent, 
    icon = 'dollar',
    showChange = true 
  }: Props = $props();

  const iconComponents = {
    'dollar': DollarSign,
    'calendar': Calendar,
    'trending-up': TrendingUp,
    'trending-down': TrendingDown
  };

  const IconComponent = iconComponents[icon];

  const isPositive = $derived((change || 0) >= 0);
  const changeColor = $derived(isPositive ? 'text-success-600' : 'text-danger-600');
  const changeIcon = $derived(isPositive ? TrendingUp : TrendingDown);
</script>

<div class="card relative">
  <!-- Icon positioned in top-right corner -->
  <div class="absolute top-3 right-3">
    <div class="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
      <IconComponent class="w-5 h-5 text-primary-600" />
    </div>
  </div>
  
  <!-- Content area with right padding to avoid icon overlap -->
  <div class="pr-20">
    <p class="text-sm font-medium text-gray-600">{title}</p>
    <p class="text-2xl font-bold text-gray-900 mt-1">
      {typeof value === 'number' ? formatCurrency(value) : value}
    </p>
    
    {#if showChange && change !== undefined && changePercent !== undefined}
      {@const ChangeIcon = changeIcon}
      <div class="flex items-center mt-2">
        <ChangeIcon class="w-4 h-4 {changeColor} mr-1" />
        <span class="text-sm font-medium {changeColor}">
          {isPositive ? '+' : ''}{formatCurrency(change)}
          ({isPositive ? '+' : ''}{formatPercent(changePercent)})
        </span>
      </div>
    {/if}
  </div>
</div>