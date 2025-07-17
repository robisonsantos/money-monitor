<script lang="ts">
  import { goto } from '$app/navigation';
  import { TrendingUp, User, LogOut } from 'lucide-svelte';
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
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <TrendingUp class="h-8 w-8 text-blue-600" />
            <span class="ml-2 text-xl font-bold text-gray-900">Money Monitor</span>
          </div>
          <nav class="hidden md:ml-6 md:flex md:space-x-8">
            <a href="/dashboard" class="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
              Dashboard
            </a>
            <a href="/dashboard/add" class="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
              Add Entry
            </a>
          </nav>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center space-x-3">
            <User class="h-5 w-5 text-gray-400" />
            <span class="text-sm font-medium text-gray-700">{data.user.name || data.user.email}</span>
          </div>
          <button
            onclick={signOut}
            class="flex items-center space-x-2 text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            <LogOut class="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      {@render children()}
    </div>
  </main>
</div> 