<script lang="ts">
  import { goto } from '$app/navigation';
  import { TrendingUp, User, LogOut, BarChart3, Plus } from 'lucide-svelte';
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: any } = $props();

  async function signOut() {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      goto('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Money Monitor</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Navigation Header -->
  <header class="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <TrendingUp class="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span class="ml-2 text-lg sm:text-xl font-bold text-gray-900">Money Monitor</span>
          </div>
          <nav class="hidden md:ml-6 md:flex md:space-x-8">
            <a href="/dashboard" class="flex items-center space-x-2 text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors group">
              <BarChart3 class="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Dashboard</span>
            </a>
            <a href="/dashboard/add" class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors group">
              <Plus class="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Add Entry</span>
            </a>
          </nav>
        </div>
        
        <div class="flex items-center space-x-2 sm:space-x-4">
          <div class="flex items-center space-x-2 sm:space-x-3">
            <User class="h-5 w-5 text-gray-400" />
            <span class="text-sm font-medium text-gray-700 truncate max-w-[120px] sm:max-w-none">{data.user.name || data.user.email}</span>
          </div>
          <button
            onclick={signOut}
            class="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-gray-700 px-2 sm:px-3 py-2 rounded-md text-sm font-medium"
          >
            <LogOut class="h-4 w-4" />
            <span class="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content with padding to account for sticky navbar -->
  <main class="max-w-7xl mx-auto pt-4 sm:pt-6 pb-12 sm:px-6 lg:px-8">
    <div class="px-4 py-4 sm:py-6 sm:px-0">
      {@render children()}
    </div>
  </main>
</div> 