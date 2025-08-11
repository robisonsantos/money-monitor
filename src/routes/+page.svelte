<script lang="ts">
  import { goto } from "$app/navigation";
  import { dev } from "$app/environment";
  import { TrendingUp, BarChart3, DollarSign, Shield, Upload, Calendar, Eye, EyeOff, Check } from "lucide-svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";

  let isSignUp = $state(false);
  let email = $state("");
  let password = $state("");
  let name = $state("");
  let loading = $state(false);
  let error = $state("");
  let showPassword = $state(false);

  // Password strength validation (for signup)
  let passwordRules = $derived({
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password),
  });

  async function handleAuth() {
    if (!email || !password) {
      error = "Email and password are required";
      return;
    }

    loading = true;
    error = "";

    try {
      const endpoint = isSignUp ? "/api/auth/signup" : "/api/auth/signin";
      const body = isSignUp ? { email, password, name } : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        goto("/dashboard");
      } else {
        error = result.error || "Authentication failed";
      }
    } catch (e) {
      error = "Network error. Please try again.";
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    isSignUp = !isSignUp;
    error = "";
    name = "";
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<svelte:head>
  <title>Money Monitor - Track Your Investment Portfolio</title>
  <meta
    name="description"
    content="Professional investment tracking with beautiful charts, analytics, and portfolio insights. Track your financial journey with ease."
  />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background-secondary via-background-primary to-background-tertiary">
  <!-- Hero Section -->
  <div class="relative">
    <!-- Navigation -->
    <nav class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <TrendingUp class="h-8 w-8 text-blue-600" />
          <span class="text-2xl font-bold text-foreground-primary">Money Monitor</span>
        </div>
        <div class="flex items-center space-x-3">
          <!-- Theme toggle for all screen sizes -->
          <ThemeToggle variant="button" size="md" />

          <!-- Desktop navigation -->
          <div class="hidden md:flex items-center space-x-6">
            <button
              onclick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              class="text-foreground-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Features
            </button>
            <button
              onclick={() => document.getElementById("benefits")?.scrollIntoView({ behavior: "smooth" })}
              class="text-foreground-secondary hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Benefits
            </button>
            <button
              onclick={() => document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" })}
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>

          <!-- Mobile "Get Started" button -->
          <div class="md:hidden">
            <button
              onclick={() => document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" })}
              class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Content -->
    <div class="container mx-auto px-6 py-16">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-5xl font-bold text-foreground-primary leading-tight mb-6">
            Track Your <span class="text-accent-primary">Investment Journey</span>
          </h1>
          <p class="text-xl text-foreground-secondary mb-8">
            Professional portfolio tracking with beautiful analytics, secure data encryption, and powerful insights to
            help you make informed investment decisions.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              onclick={() => document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" })}
              class="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Start Tracking Today
            </button>
            <button
              onclick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              class="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              Learn More
            </button>
          </div>
        </div>

        <!-- Hero Image/Chart Mockup -->
        <div class="relative">
          <div class="bg-background-primary rounded-2xl shadow-2xl dark:shadow-none dark:ring-1 dark:ring-white/10 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 p-6 border border-border-primary">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-foreground-primary">Portfolio Overview</h3>
              <span class="text-success-600 text-sm font-medium">+12.5% this month</span>
            </div>
            <div
              class="h-48 bg-gradient-to-r from-blue-400 to-green-400 rounded-lg opacity-80 flex items-end justify-around p-4"
            >
              <div class="bg-white/30 w-8 h-20 rounded"></div>
              <div class="bg-white/30 w-8 h-32 rounded"></div>
              <div class="bg-white/30 w-8 h-24 rounded"></div>
              <div class="bg-white/30 w-8 h-40 rounded"></div>
              <div class="bg-white/30 w-8 h-36 rounded"></div>
              <div class="bg-white/30 w-8 h-44 rounded"></div>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-sm text-foreground-tertiary">Total Value</div>
                <div class="font-semibold text-foreground-primary">$45,230</div>
              </div>
              <div>
                <div class="text-sm text-foreground-tertiary">Today's Change</div>
                <div class="font-semibold text-success-600 dark:text-success-400">+$1,524</div>
              </div>
              <div>
                <div class="text-sm text-foreground-tertiary">Gain</div>
                <div class="font-semibold text-success-600">+$5,120</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Features Section -->
  <section id="features" class="py-20 bg-background-primary">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-foreground-primary mb-4">Powerful Features</h2>
        <p class="text-xl text-foreground-secondary">
          Everything you need to track and analyze your investment portfolio
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="text-center group p-6 rounded-xl dark:bg-gradient-to-br dark:from-slate-800/30 dark:to-slate-900/30 dark:ring-1 dark:ring-white/5 hover:dark:ring-white/10 transition-all">
          <div
            class="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/30 transition-colors"
          >
            <BarChart3 class="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 class="text-xl font-semibold text-foreground-primary mb-2">Interactive Charts</h3>
          <p class="text-foreground-secondary">
            Beautiful, responsive charts that visualize your portfolio performance across different time periods with
            daily, weekly, and monthly views.
          </p>
        </div>

        <div class="text-center group p-6 rounded-xl dark:bg-gradient-to-br dark:from-slate-800/30 dark:to-slate-900/30 dark:ring-1 dark:ring-white/5 hover:dark:ring-white/10 transition-all">
          <div
            class="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800/30 transition-colors"
          >
            <TrendingUp class="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 class="text-xl font-semibold text-foreground-primary mb-2">Advanced Analytics</h3>
          <p class="text-foreground-secondary">
            Comprehensive portfolio statistics including current value, daily changes, best and worst performing days,
            and trend analysis.
          </p>
        </div>

        <div class="text-center group p-6 rounded-xl dark:bg-gradient-to-br dark:from-slate-800/30 dark:to-slate-900/30 dark:ring-1 dark:ring-white/5 hover:dark:ring-white/10 transition-all">
          <div
            class="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/30 transition-colors"
          >
            <Upload class="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 class="text-xl font-semibold text-foreground-primary mb-2">CSV Import/Export</h3>
          <p class="text-foreground-secondary">Easily import your existing data or export for external analysis</p>
          <p class="text-foreground-secondary">
            Easily import your existing data from CSV files and export your portfolio data for external analysis or
            backup purposes.
          </p>
        </div>

        <div class="text-center group p-6 rounded-xl dark:bg-gradient-to-br dark:from-slate-800/30 dark:to-slate-900/30 dark:ring-1 dark:ring-white/5 hover:dark:ring-white/10 transition-all">
          <div
            class="bg-orange-100 dark:bg-orange-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/30 transition-colors"
          >
            <Calendar class="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 class="text-xl font-semibold text-foreground-primary mb-2">Time-based Filtering</h3>
          <p class="text-foreground-secondary">
            Filter your data by specific time periods (7d, 30d, 60d, 3m, 1y) to analyze performance trends and identify
            patterns.
          </p>
        </div>

        <div class="text-center group p-6 rounded-xl dark:bg-gradient-to-br dark:from-slate-800/30 dark:to-slate-900/30 dark:ring-1 dark:ring-white/5 hover:dark:ring-white/10 transition-all">
          <div
            class="bg-red-100 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 dark:group-hover:bg-red-800/30 transition-colors"
          >
            <Shield class="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 class="text-xl font-semibold text-foreground-primary mb-2">Secure & Private</h3>
          <p class="text-foreground-secondary">
            Your financial data is stored securely with user authentication, ensuring your portfolio information remains
            private and protected.
          </p>
        </div>

        <div class="text-center group p-6 rounded-xl dark:bg-gradient-to-br dark:from-slate-800/30 dark:to-slate-900/30 dark:ring-1 dark:ring-white/5 hover:dark:ring-white/10 transition-all">
          <div
            class="bg-indigo-100 dark:bg-indigo-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/30 transition-colors"
          >
            <DollarSign class="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 class="text-xl font-semibold text-foreground-primary mb-2">Mobile Responsive</h3>
          <p class="text-foreground-secondary">
            Access your portfolio anywhere with our fully responsive design that works beautifully on desktop, tablet,
            and mobile devices.
          </p>
        </div>
      </div>
    </div>
  </section>

  <!-- Benefits Section -->
  <section id="benefits" class="py-20 bg-background-secondary">
    <div class="container mx-auto px-6">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-4xl font-bold text-foreground-primary mb-6">Why Choose Money Monitor?</h2>
          <div class="space-y-6">
            <div class="flex items-start space-x-4">
              <div
                class="bg-success-100 dark:bg-success-900/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              >
                <div class="w-2 h-2 bg-success-600 dark:bg-success-400 rounded-full"></div>
              </div>
              <div>
                <h3 class="font-semibold text-foreground-primary mb-1">Professional Grade</h3>
                <p class="text-foreground-secondary">Built with the same standards as professional trading platforms</p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div
                class="bg-blue-100 dark:bg-blue-900/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              >
                <div class="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
              </div>
              <div>
                <h3 class="font-semibold text-foreground-primary mb-1">Easy Data Management</h3>
                <p class="text-foreground-secondary">
                  Simple interface for adding entries, bulk CSV imports, and exporting your data whenever you need it.
                </p>
              </div>
            </div>

            <div class="flex items-start space-x-4">
              <div
                class="bg-primary-100 dark:bg-primary-900/20 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
              >
                <div class="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
              </div>
              <div>
                <h3 class="font-semibold text-foreground-primary mb-1">Privacy First</h3>
                <p class="text-foreground-secondary">Your data stays yours. No ads, no selling, no compromises.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-background-primary rounded-2xl shadow-xl dark:shadow-none dark:ring-1 dark:ring-white/10 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 p-8 border border-border-primary">
          <h3 class="text-2xl font-bold text-foreground-primary mb-6">Get Started in 3 Steps</h3>
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div
                class="bg-accent-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
              >
                1
              </div>
              <span class="text-foreground-secondary">Create your free account</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="bg-accent-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
              >
                2
              </div>
              <span class="text-foreground-secondary">Add your first investment entry</span>
            </div>
            <div class="flex items-center space-x-3">
              <div
                class="bg-accent-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
              >
                3
              </div>
              <span class="text-foreground-secondary">Watch your portfolio grow</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Auth Section -->
  <section id="auth-section" class="py-20 bg-background-primary">
    <div class="container mx-auto px-6">
      <div class="max-w-md mx-auto">
        <div class="bg-background-primary rounded-2xl shadow-xl dark:shadow-none dark:ring-1 dark:ring-white/10 dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 p-8 border border-border-primary">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-foreground-primary mb-2">
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </h2>
            <p class="text-foreground-secondary">
              {isSignUp ? "Start tracking your investments today" : "Sign in to continue tracking your portfolio"}
            </p>
          </div>

          <form
            onsubmit={(e) => {
              e.preventDefault();
              handleAuth();
            }}
            class="space-y-6"
          >
            {#if isSignUp}
              <div>
                <label for="name" class="label">Full Name</label>
                <input
                  type="text"
                  id="name"
                  bind:value={name}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
            {/if}

            <div>
              <label for="email" class="label">Email Address</label>
              <input
                type="email"
                id="email"
                bind:value={email}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label for="password" class="label">Password</label>
              <div class="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  bind:value={password}
                  required
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onclick={togglePasswordVisibility}
                  class="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {#if showPassword}
                    <EyeOff class="w-5 h-5" />
                  {:else}
                    <Eye class="w-5 h-5" />
                  {/if}
                </button>
              </div>

              <!-- Password Strength Indicator (Signup Only) -->
              {#if isSignUp}
                <div class="mt-4 p-4 bg-background-secondary rounded-lg border border-border-primary dark:bg-gradient-to-br dark:from-slate-800/40 dark:to-slate-900/40 dark:ring-1 dark:ring-white/10">
                  <h4 class="text-sm font-medium text-foreground-secondary mb-3">Password Requirements:</h4>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <div
                        class="flex-shrink-0 w-5 h-5 rounded-full border-2 {passwordRules.length
                          ? 'bg-success-500 border-success-500'
                          : 'border-border-secondary'} flex items-center justify-center"
                      >
                        {#if passwordRules.length}
                          <Check class="w-3 h-3 text-white" />
                        {/if}
                      </div>
                      <span
                        class="text-sm {passwordRules.length
                          ? 'text-success-700 dark:text-success-300'
                          : 'text-foreground-tertiary'}"
                      >
                        At least 12 characters
                      </span>
                    </div>

                    <div class="flex items-center space-x-2">
                      <div
                        class="flex-shrink-0 w-5 h-5 rounded-full border-2 {passwordRules.uppercase
                          ? 'bg-success-500 border-success-500'
                          : 'border-border-secondary'} flex items-center justify-center"
                      >
                        {#if passwordRules.uppercase}
                          <Check class="w-3 h-3 text-white" />
                        {/if}
                      </div>
                      <span
                        class="text-sm {passwordRules.uppercase
                          ? 'text-success-700 dark:text-success-300'
                          : 'text-foreground-tertiary'}"
                      >
                        One uppercase letter (A-Z)
                      </span>
                    </div>

                    <div class="flex items-center space-x-2">
                      <div
                        class="flex-shrink-0 w-5 h-5 rounded-full border-2 {passwordRules.lowercase
                          ? 'bg-success-500 border-success-500'
                          : 'border-border-secondary'} flex items-center justify-center"
                      >
                        {#if passwordRules.lowercase}
                          <Check class="w-3 h-3 text-white" />
                        {/if}
                      </div>
                      <span
                        class="text-sm {passwordRules.lowercase
                          ? 'text-success-700 dark:text-success-300'
                          : 'text-foreground-tertiary'}"
                      >
                        One lowercase letter (a-z)
                      </span>
                    </div>

                    <div class="flex items-center space-x-2">
                      <div
                        class="flex-shrink-0 w-5 h-5 rounded-full border-2 {passwordRules.number
                          ? 'bg-success-500 border-success-500'
                          : 'border-border-secondary'} flex items-center justify-center"
                      >
                        {#if passwordRules.number}
                          <Check class="w-3 h-3 text-white" />
                        {/if}
                      </div>
                      <span
                        class="text-sm {passwordRules.number
                          ? 'text-success-700 dark:text-success-300'
                          : 'text-foreground-tertiary'}"
                      >
                        One number (0-9)
                      </span>
                    </div>

                    <div class="flex items-center space-x-2">
                      <div
                        class="flex-shrink-0 w-5 h-5 rounded-full border-2 {passwordRules.special
                          ? 'bg-success-500 border-success-500'
                          : 'border-border-secondary'} flex items-center justify-center"
                      >
                        {#if passwordRules.special}
                          <Check class="w-3 h-3 text-white" />
                        {/if}
                      </div>
                      <span
                        class="text-sm {passwordRules.special
                          ? 'text-success-700 dark:text-success-300'
                          : 'text-foreground-tertiary'}"
                      >
                        One special character (@$!%*?&)
                      </span>
                    </div>
                  </div>
                </div>
              {/if}
            </div>

            {#if error}
              <div class="alert-danger">
                {error}
              </div>
            {/if}

            <button type="submit" disabled={loading} class="w-full btn-primary py-3 font-semibold">
              {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div class="mt-6 text-center">
            <button
              onclick={toggleMode}
              class="text-accent-primary hover:text-accent-secondary font-medium transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>

          <!-- Demo Credentials (Development Only) -->
          {#if dev}
            <div class="mt-6 p-4 bg-background-secondary rounded-lg border border-border-primary dark:bg-gradient-to-br dark:from-slate-800/40 dark:to-slate-900/40 dark:ring-1 dark:ring-white/10">
              <h4 class="font-medium text-foreground-primary mb-2">Demo Account</h4>
              <p class="text-sm text-foreground-secondary mb-2"><strong>Email:</strong> admin@moneymonitor.com</p>
              <p class="text-sm text-foreground-secondary"><strong>Password:</strong> 123456</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-foreground-primary text-background-primary py-12">
    <div class="container mx-auto px-6 text-center">
      <div class="flex items-center justify-center space-x-2 mb-4">
        <TrendingUp class="h-6 w-6" />
        <span class="text-xl font-bold">Money Monitor</span>
      </div>
      <p class="text-background-secondary">
        Track your investments with confidence. Built with privacy and security in mind.
      </p>
    </div>
  </footer>
</div>
