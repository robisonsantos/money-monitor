<script lang="ts">
  import { goto } from "$app/navigation";
  import { TrendingUp, User, LogOut, BarChart3, Plus } from "lucide-svelte";
  import Breadcrumb from "$lib/components/Breadcrumb.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import { portfolioStore, selectedPortfolio } from "$lib/stores/portfolio";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import type { LayoutData } from "./$types";

  let { data, children }: { data: LayoutData; children: any } = $props();

  // Load portfolios when component mounts
  onMount(() => {
    if (browser) {
      portfolioStore.loadPortfolios();
    }
  });

  async function signOut() {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      goto("/");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Money Monitor</title>
</svelte:head>

<div class="min-h-screen bg-background-secondary">
  <!-- Navigation Header -->
  <header class="sticky top-0 z-50 bg-background-primary shadow-sm border-b border-border-primary">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0 flex items-center">
            <TrendingUp class="h-6 w-6 sm:h-8 sm:w-8 text-accent-primary" />
            <span class="ml-2 text-lg sm:text-xl font-bold text-foreground-primary">Money Monitor</span>
          </div>
          <nav class="hidden md:ml-6 md:flex md:space-x-8">
            <a
              href="/dashboard"
              class="nav-link-active flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors group"
            >
              <BarChart3 class="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Dashboard</span>
            </a>
            <a
              href="/dashboard/add"
              class="nav-link flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors group"
            >
              <Plus class="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span>Add Entry</span>
            </a>
          </nav>
        </div>

        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Theme Toggle -->
          <div class="no-print">
            <ThemeToggle variant="button" size="md" />
          </div>

          <div class="flex items-center space-x-2 sm:space-x-3">
            <User class="h-5 w-5 text-foreground-tertiary" />
            <span class="text-sm font-medium text-foreground-secondary truncate max-w-[120px] sm:max-w-none"
              >{data.user.name || data.user.email}</span
            >
          </div>
          <button
            onclick={signOut}
            class="flex items-center space-x-1 sm:space-x-2 text-foreground-secondary hover:text-foreground-primary px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors"
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
      <!-- Breadcrumb Navigation -->
      <Breadcrumb selectedPortfolio={$selectedPortfolio} />

      {@render children()}
    </div>
  </main>
</div>
