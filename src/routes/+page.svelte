<script lang="ts">
  import { goto } from '$app/navigation';
  import { dev } from '$app/environment';
  import { TrendingUp, BarChart3, DollarSign, Shield, Upload, Calendar, Eye, EyeOff } from 'lucide-svelte';

  let isSignUp = $state(false);
  let email = $state('');
  let password = $state('');
  let name = $state('');
  let loading = $state(false);
  let error = $state('');
  let showPassword = $state(false);

  async function handleAuth() {
    if (!email || !password) {
      error = 'Email and password are required';
      return;
    }

    loading = true;
    error = '';

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin';
      const body = isSignUp ? { email, password, name } : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if (result.success) {
        goto('/dashboard');
      } else {
        error = result.error || 'Authentication failed';
      }
    } catch (e) {
      error = 'Network error. Please try again.';
    } finally {
      loading = false;
    }
  }

  function toggleMode() {
    isSignUp = !isSignUp;
    error = '';
    name = '';
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<svelte:head>
  <title>Money Monitor - Track Your Investment Portfolio</title>
  <meta name="description" content="Professional investment tracking with beautiful charts, analytics, and portfolio insights. Track your financial journey with ease." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  <!-- Hero Section -->
  <div class="relative">
    <!-- Navigation -->
    <nav class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <TrendingUp class="h-8 w-8 text-blue-600" />
          <span class="text-2xl font-bold text-gray-900">Money Monitor</span>
        </div>
                 <div class="hidden md:flex items-center space-x-6">
           <button 
             onclick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
             class="text-gray-600 hover:text-blue-600 transition-colors"
           >
             Features
           </button>
           <button 
             onclick={() => document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth' })}
             class="text-gray-600 hover:text-blue-600 transition-colors"
           >
             Benefits
           </button>
           <button 
             onclick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
             class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
           >
             Get Started
           </button>
         </div>
      </div>
    </nav>

    <!-- Hero Content -->
    <div class="container mx-auto px-6 py-16">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 class="text-5xl font-bold text-gray-900 leading-tight mb-6">
            Track Your <span class="text-blue-600">Investment Journey</span> with Confidence
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Professional portfolio tracking with beautiful visualizations, comprehensive analytics, and insights that help you make informed investment decisions.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button 
              onclick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
              class="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Start Tracking Today
            </button>
            <button 
              onclick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              class="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              Learn More
            </button>
          </div>
        </div>
        
        <!-- Hero Image/Chart Mockup -->
        <div class="relative">
          <div class="bg-white rounded-2xl shadow-2xl p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold text-gray-900">Portfolio Performance</h3>
              <span class="text-green-600 text-sm font-medium">+12.5%</span>
            </div>
            <div class="h-48 bg-gradient-to-r from-blue-400 to-green-400 rounded-lg opacity-80 flex items-end justify-around p-4">
              <div class="bg-white/30 w-8 h-20 rounded"></div>
              <div class="bg-white/30 w-8 h-32 rounded"></div>
              <div class="bg-white/30 w-8 h-24 rounded"></div>
              <div class="bg-white/30 w-8 h-40 rounded"></div>
              <div class="bg-white/30 w-8 h-36 rounded"></div>
              <div class="bg-white/30 w-8 h-44 rounded"></div>
            </div>
            <div class="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <div class="text-sm text-gray-500">Total Value</div>
                <div class="font-semibold text-gray-900">$125,432</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">Today's Change</div>
                <div class="font-semibold text-green-600">+$1,524</div>
              </div>
              <div>
                <div class="text-sm text-gray-500">7-Day Return</div>
                <div class="font-semibold text-green-600">+3.2%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Features Section -->
  <section id="features" class="py-20 bg-white">
    <div class="container mx-auto px-6">
      <div class="text-center mb-16">
        <h2 class="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
        <p class="text-xl text-gray-600">Everything you need to track and analyze your investment portfolio</p>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div class="text-center group">
          <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
            <BarChart3 class="h-8 w-8 text-blue-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Interactive Charts</h3>
          <p class="text-gray-600">Beautiful, responsive charts that visualize your portfolio performance across different time periods with daily, weekly, and monthly views.</p>
        </div>
        
        <div class="text-center group">
          <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
            <TrendingUp class="h-8 w-8 text-green-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
          <p class="text-gray-600">Comprehensive portfolio statistics including current value, daily changes, best and worst performing days, and trend analysis.</p>
        </div>
        
        <div class="text-center group">
          <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
            <Upload class="h-8 w-8 text-purple-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">CSV Import/Export</h3>
          <p class="text-gray-600">Easily import your existing data from CSV files and export your portfolio data for external analysis or backup purposes.</p>
        </div>
        
        <div class="text-center group">
          <div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
            <Calendar class="h-8 w-8 text-orange-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Time-based Filtering</h3>
          <p class="text-gray-600">Filter your data by specific time periods (7d, 30d, 60d, 3m, 1y) to analyze performance trends and identify patterns.</p>
        </div>
        
        <div class="text-center group">
          <div class="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
            <Shield class="h-8 w-8 text-red-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
          <p class="text-gray-600">Your financial data is stored securely with user authentication, ensuring your portfolio information remains private and protected.</p>
        </div>
        
        <div class="text-center group">
          <div class="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
            <DollarSign class="h-8 w-8 text-indigo-600" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Mobile Responsive</h3>
          <p class="text-gray-600">Access your portfolio anywhere with our fully responsive design that works beautifully on desktop, tablet, and mobile devices.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Benefits Section -->
  <section id="benefits" class="py-20 bg-gray-50">
    <div class="container mx-auto px-6">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-4xl font-bold text-gray-900 mb-6">Why Choose Money Monitor?</h2>
          <div class="space-y-6">
            <div class="flex items-start space-x-4">
              <div class="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div class="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Professional Grade Analytics</h3>
                <p class="text-gray-600">Get insights typically available only in expensive portfolio management software, completely free.</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Easy Data Management</h3>
                <p class="text-gray-600">Simple interface for adding entries, bulk CSV imports, and exporting your data whenever you need it.</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <div class="w-2 h-2 bg-purple-600 rounded-full"></div>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Privacy Focused</h3>
                <p class="text-gray-600">Your financial data stays yours. No third-party integrations or data sharing - complete privacy and control.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Start tracking in minutes</h3>
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span class="text-gray-700">Create your free account</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span class="text-gray-700">Add your first investment entry</span>
            </div>
            <div class="flex items-center space-x-3">
              <div class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span class="text-gray-700">Watch your portfolio come to life</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Auth Section -->
  <section id="auth-section" class="py-20 bg-white">
    <div class="container mx-auto px-6">
      <div class="max-w-md mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p class="text-gray-600">
              {isSignUp ? 'Start tracking your investments today' : 'Sign in to your account'}
            </p>
          </div>

          <form onsubmit={(e) => { e.preventDefault(); handleAuth(); }} class="space-y-6">
            {#if isSignUp}
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700 mb-2">Name</label>
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
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div class="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  bind:value={password}
                  required
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
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
            </div>

            {#if error}
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            {/if}

            <button
              type="submit"
              disabled={loading}
              class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div class="mt-6 text-center">
            <button
              onclick={toggleMode}
              class="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          <!-- Demo Credentials (Development Only) -->
          {#if dev}
            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 class="font-medium text-gray-900 mb-2">Demo Account (Dev Mode)</h4>
              <p class="text-sm text-gray-600 mb-2">Email: admin@moneymonitor.com</p>
              <p class="text-sm text-gray-600">Password: 123456</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-gray-900 text-white py-12">
    <div class="container mx-auto px-6 text-center">
      <div class="flex items-center justify-center space-x-2 mb-4">
        <TrendingUp class="h-6 w-6" />
        <span class="text-xl font-bold">Money Monitor</span>
      </div>
      <p class="text-gray-400">
        Professional investment tracking made simple and secure.
      </p>
    </div>
  </footer>
</div>