<script lang="ts">
  import { onMount } from 'svelte';
  import { themeStore, getThemeIcon, getThemeLabel, getNextThemeLabel } from '$lib/stores/theme';
  import { Sun, Moon, Monitor } from 'lucide-svelte';

  // Component props
  export let showLabel = false;
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let variant: 'button' | 'dropdown' = 'button';

  // Store state
  $: theme = $themeStore.theme;
  $: resolvedTheme = $themeStore.resolvedTheme;

  // Size variants
  $: sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  }[size];

  $: iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  }[size];

  // Dropdown state
  let dropdownOpen = false;
  let dropdownButton: HTMLButtonElement;
  let dropdownMenu: HTMLDivElement;

  // Initialize theme on mount
  onMount(() => {
    const cleanup = themeStore.initialize();
    return cleanup;
  });

  // Handle simple toggle (button variant)
  const handleToggle = () => {
    themeStore.toggleTheme();
  };

  // Handle theme selection (dropdown variant)
  const handleThemeSelect = (selectedTheme: 'light' | 'dark' | 'system') => {
    themeStore.setTheme(selectedTheme);
    dropdownOpen = false;
    dropdownButton?.focus();
  };

  // Dropdown keyboard navigation
  const handleDropdownKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      dropdownOpen = false;
      dropdownButton?.focus();
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownOpen &&
      dropdownMenu &&
      !dropdownMenu.contains(event.target as Node) &&
      !dropdownButton?.contains(event.target as Node)
    ) {
      dropdownOpen = false;
    }
  };

  $: if (typeof window !== 'undefined') {
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', handleDropdownKeydown);
    } else {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleDropdownKeydown);
    }
  }

  // Get current theme icon component
  $: ThemeIcon = theme === 'system'
    ? Monitor
    : theme === 'dark'
      ? Moon
      : Sun;

  // Animation classes
  const transitionClasses = 'transition-all duration-200 ease-in-out';
  const hoverClasses = 'hover:bg-background-secondary hover:scale-105';
  const focusClasses = 'focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background-primary';
  const activeClasses = 'active:scale-95';
</script>

<svelte:window on:beforeunload={() => {
  document.removeEventListener('click', handleClickOutside);
  document.removeEventListener('keydown', handleDropdownKeydown);
}} />

{#if variant === 'button'}
  <!-- Simple toggle button -->
  <button
    type="button"
    class="
      {sizeClasses}
      {transitionClasses}
      {hoverClasses}
      {focusClasses}
      {activeClasses}
      inline-flex items-center justify-center
      rounded-lg
      bg-background-secondary
      text-foreground-primary
      border border-border-primary
      shadow-sm
      relative
      overflow-hidden
      group
    "
    on:click={handleToggle}
    aria-label={getNextThemeLabel(theme, resolvedTheme)}
    title={getNextThemeLabel(theme, resolvedTheme)}
  >
    <!-- Icon with smooth transition -->
    <div class="relative {transitionClasses} group-hover:rotate-12">
      <svelte:component
        this={ThemeIcon}
        size={iconSize}
        class="drop-shadow-sm"
      />
    </div>

    <!-- Optional label -->
    {#if showLabel}
      <span class="ml-2 text-sm font-medium">
        {getThemeLabel(theme)}
      </span>
    {/if}

    <!-- Ripple effect background -->
    <div class="
      absolute inset-0
      bg-gradient-to-r from-transparent via-accent-primary/10 to-transparent
      translate-x-[-100%] group-hover:translate-x-[100%]
      transition-transform duration-700 ease-in-out
    "></div>
  </button>

{:else if variant === 'dropdown'}
  <!-- Dropdown theme selector -->
  <div class="relative">
    <button
      bind:this={dropdownButton}
      type="button"
      class="
        {sizeClasses}
        {transitionClasses}
        {hoverClasses}
        {focusClasses}
        {activeClasses}
        inline-flex items-center justify-center
        rounded-lg
        bg-background-secondary
        text-foreground-primary
        border border-border-primary
        shadow-sm
        relative
        group
      "
      on:click={() => dropdownOpen = !dropdownOpen}
      aria-label="Theme options"
      aria-expanded={dropdownOpen}
      aria-haspopup="menu"
      title="Change theme"
    >
      <div class="relative {transitionClasses} group-hover:rotate-12">
        <svelte:component
          this={ThemeIcon}
          size={iconSize}
          class="drop-shadow-sm"
        />
      </div>

      {#if showLabel}
        <span class="ml-2 text-sm font-medium">
          {getThemeLabel(theme)}
        </span>
      {/if}
    </button>

    <!-- Dropdown menu -->
    {#if dropdownOpen}
      <div
        bind:this={dropdownMenu}
        class="
          absolute right-0 mt-2 w-48
          bg-background-primary
          border border-border-primary
          rounded-lg shadow-lg
          ring-1 ring-black/5
          dark:ring-white/10
          z-50
          animate-in slide-in-from-top-2 duration-200
        "
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="theme-menu"
      >
        <div class="p-1">
          <!-- Light mode option -->
          <button
            type="button"
            class="
              w-full px-3 py-2
              text-left text-sm
              text-foreground-primary
              rounded-md
              {transitionClasses}
              hover:bg-background-secondary
              focus:bg-background-secondary
              focus:outline-none
              flex items-center gap-3
              {theme === 'light' ? 'bg-background-secondary' : ''}
            "
            role="menuitem"
            on:click={() => handleThemeSelect('light')}
            aria-current={theme === 'light' ? 'true' : 'false'}
          >
            <Sun size={16} class="text-amber-500" />
            <span>Light</span>
            {#if theme === 'light'}
              <div class="ml-auto w-2 h-2 bg-accent-primary rounded-full"></div>
            {/if}
          </button>

          <!-- Dark mode option -->
          <button
            type="button"
            class="
              w-full px-3 py-2
              text-left text-sm
              text-foreground-primary
              rounded-md
              {transitionClasses}
              hover:bg-background-secondary
              focus:bg-background-secondary
              focus:outline-none
              flex items-center gap-3
              {theme === 'dark' ? 'bg-background-secondary' : ''}
            "
            role="menuitem"
            on:click={() => handleThemeSelect('dark')}
            aria-current={theme === 'dark' ? 'true' : 'false'}
          >
            <Moon size={16} class="text-blue-400" />
            <span>Dark</span>
            {#if theme === 'dark'}
              <div class="ml-auto w-2 h-2 bg-accent-primary rounded-full"></div>
            {/if}
          </button>

          <!-- System mode option -->
          <button
            type="button"
            class="
              w-full px-3 py-2
              text-left text-sm
              text-foreground-primary
              rounded-md
              {transitionClasses}
              hover:bg-background-secondary
              focus:bg-background-secondary
              focus:outline-none
              flex items-center gap-3
              {theme === 'system' ? 'bg-background-secondary' : ''}
            "
            role="menuitem"
            on:click={() => handleThemeSelect('system')}
            aria-current={theme === 'system' ? 'true' : 'false'}
          >
            <Monitor size={16} class="text-slate-500" />
            <span>System</span>
            {#if theme === 'system'}
              <div class="ml-auto w-2 h-2 bg-accent-primary rounded-full"></div>
            {/if}
          </button>
        </div>

        <!-- System preference indicator -->
        {#if theme === 'system'}
          <div class="border-t border-border-primary p-2">
            <div class="text-xs text-foreground-tertiary flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-accent-primary rounded-full animate-pulse"></div>
              Currently: {resolvedTheme === 'dark' ? 'Dark' : 'Light'}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* Custom animations */
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-in {
    animation: animate-in 0.2s ease-out;
  }

  .slide-in-from-top-2 {
    animation: slide-in-from-top-2 0.2s ease-out;
  }

  @keyframes slide-in-from-top-2 {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .transition-all,
    .animate-in,
    .slide-in-from-top-2 {
      transition: none;
      animation: none;
    }

    .group-hover\:rotate-12:hover {
      transform: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    button {
      border-width: 2px;
    }
  }
</style>
