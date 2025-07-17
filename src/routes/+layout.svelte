<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { TrendingUp, Plus, BarChart3 } from 'lucide-svelte';

  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/add', label: 'Add Entry', icon: Plus }
  ];
</script>

<div class="min-h-screen bg-gray-50">
  <!-- Navigation -->
  <nav class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex items-center space-x-2">
            <TrendingUp class="w-8 h-8 text-primary-600" />
            <h1 class="text-xl font-bold text-gray-900">Money Monitor</h1>
          </div>
        </div>
        
        <div class="flex items-center space-x-8">
          {#each navItems as item}
            <a 
              href={item.href}
              class="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 {
                $page.url.pathname === item.href 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }"
            >
              <svelte:component this={item.icon} class="w-4 h-4" />
              <span>{item.label}</span>
            </a>
          {/each}
        </div>
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <slot />
  </main>
</div>