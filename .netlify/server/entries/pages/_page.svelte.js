import { Y as sanitize_props, Z as spread_props, T as slot, _ as head, W as escape_html, $ as attr, Q as pop, O as push } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/state.svelte.js";
import { T as Trending_up, C as Chart_column } from "../../chunks/trending-up.js";
import { I as Icon } from "../../chunks/Icon.js";
function Calendar($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M8 2v4" }],
    ["path", { "d": "M16 2v4" }],
    [
      "rect",
      { "width": "18", "height": "18", "x": "3", "y": "4", "rx": "2" }
    ],
    ["path", { "d": "M3 10h18" }]
  ];
  Icon($$payload, spread_props([
    { name: "calendar" },
    $$sanitized_props,
    {
      /**
       * @component @name Calendar
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOCAydjQiIC8+CiAgPHBhdGggZD0iTTE2IDJ2NCIgLz4KICA8cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjQiIHJ4PSIyIiAvPgogIDxwYXRoIGQ9Ik0zIDEwaDE4IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/calendar
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Dollar_sign($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["line", { "x1": "12", "x2": "12", "y1": "2", "y2": "22" }],
    [
      "path",
      { "d": "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "dollar-sign" },
    $$sanitized_props,
    {
      /**
       * @component @name DollarSign
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8bGluZSB4MT0iMTIiIHgyPSIxMiIgeTE9IjIiIHkyPSIyMiIgLz4KICA8cGF0aCBkPSJNMTcgNUg5LjVhMy41IDMuNSAwIDAgMCAwIDdoNWEzLjUgMy41IDAgMCAxIDAgN0g2IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/dollar-sign
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Shield($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "path",
      {
        "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "shield" },
    $$sanitized_props,
    {
      /**
       * @component @name Shield
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjAgMTNjMCA1LTMuNSA3LjUtNy42NiA4Ljk1YTEgMSAwIDAgMS0uNjctLjAxQzcuNSAyMC41IDQgMTggNCAxM1Y2YTEgMSAwIDAgMSAxLTFjMiAwIDQuNS0xLjIgNi4yNC0yLjcyYTEuMTcgMS4xNyAwIDAgMSAxLjUyIDBDMTQuNTEgMy44MSAxNyA1IDE5IDVhMSAxIDAgMCAxIDEgMXoiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/shield
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function Upload($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }],
    ["polyline", { "points": "17 8 12 3 7 8" }],
    ["line", { "x1": "12", "x2": "12", "y1": "3", "y2": "15" }]
  ];
  Icon($$payload, spread_props([
    { name: "upload" },
    $$sanitized_props,
    {
      /**
       * @component @name Upload
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMjEgMTV2NGEyIDIgMCAwIDEtMiAySDVhMiAyIDAgMCAxLTItMnYtNCIgLz4KICA8cG9seWxpbmUgcG9pbnRzPSIxNyA4IDEyIDMgNyA4IiAvPgogIDxsaW5lIHgxPSIxMiIgeDI9IjEyIiB5MT0iMyIgeTI9IjE1IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/upload
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: ($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      },
      $$slots: { default: true }
    }
  ]));
}
function _page($$payload, $$props) {
  push();
  let email = "";
  let password = "";
  let loading = false;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Money Monitor - Track Your Investment Portfolio</title>`;
    $$payload2.out.push(`<meta name="description" content="Professional investment tracking with beautiful charts, analytics, and portfolio insights. Track your financial journey with ease."/>`);
  });
  $$payload.out.push(`<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50"><div class="relative"><nav class="container mx-auto px-6 py-4"><div class="flex items-center justify-between"><div class="flex items-center space-x-2">`);
  Trending_up($$payload, { class: "h-8 w-8 text-blue-600" });
  $$payload.out.push(`<!----> <span class="text-2xl font-bold text-gray-900">Money Monitor</span></div> <div class="hidden md:flex items-center space-x-6"><button class="text-gray-600 hover:text-blue-600 transition-colors">Features</button> <button class="text-gray-600 hover:text-blue-600 transition-colors">Benefits</button> <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Get Started</button></div></div></nav> <div class="container mx-auto px-6 py-16"><div class="grid lg:grid-cols-2 gap-12 items-center"><div><h1 class="text-5xl font-bold text-gray-900 leading-tight mb-6">Track Your <span class="text-blue-600">Investment Journey</span> with Confidence</h1> <p class="text-xl text-gray-600 mb-8">Professional portfolio tracking with beautiful visualizations, comprehensive analytics, and insights that help you make informed investment decisions.</p> <div class="flex flex-col sm:flex-row gap-4"><button class="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">Start Tracking Today</button> <button class="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors font-semibold">Learn More</button></div></div> <div class="relative"><div class="bg-white rounded-2xl shadow-2xl p-6"><div class="flex items-center justify-between mb-4"><h3 class="font-semibold text-gray-900">Portfolio Performance</h3> <span class="text-green-600 text-sm font-medium">+12.5%</span></div> <div class="h-48 bg-gradient-to-r from-blue-400 to-green-400 rounded-lg opacity-80 flex items-end justify-around p-4"><div class="bg-white/30 w-8 h-20 rounded"></div> <div class="bg-white/30 w-8 h-32 rounded"></div> <div class="bg-white/30 w-8 h-24 rounded"></div> <div class="bg-white/30 w-8 h-40 rounded"></div> <div class="bg-white/30 w-8 h-36 rounded"></div> <div class="bg-white/30 w-8 h-44 rounded"></div></div> <div class="mt-4 grid grid-cols-3 gap-4 text-center"><div><div class="text-sm text-gray-500">Total Value</div> <div class="font-semibold text-gray-900">$125,432</div></div> <div><div class="text-sm text-gray-500">Today's Change</div> <div class="font-semibold text-green-600">+$1,524</div></div> <div><div class="text-sm text-gray-500">7-Day Return</div> <div class="font-semibold text-green-600">+3.2%</div></div></div></div></div></div></div></div> <section id="features" class="py-20 bg-white"><div class="container mx-auto px-6"><div class="text-center mb-16"><h2 class="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2> <p class="text-xl text-gray-600">Everything you need to track and analyze your investment portfolio</p></div> <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8"><div class="text-center group"><div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">`);
  Chart_column($$payload, { class: "h-8 w-8 text-blue-600" });
  $$payload.out.push(`<!----></div> <h3 class="text-xl font-semibold text-gray-900 mb-2">Interactive Charts</h3> <p class="text-gray-600">Beautiful, responsive charts that visualize your portfolio performance across different time periods with daily, weekly, and monthly views.</p></div> <div class="text-center group"><div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">`);
  Trending_up($$payload, { class: "h-8 w-8 text-green-600" });
  $$payload.out.push(`<!----></div> <h3 class="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3> <p class="text-gray-600">Comprehensive portfolio statistics including current value, daily changes, best and worst performing days, and trend analysis.</p></div> <div class="text-center group"><div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">`);
  Upload($$payload, { class: "h-8 w-8 text-purple-600" });
  $$payload.out.push(`<!----></div> <h3 class="text-xl font-semibold text-gray-900 mb-2">CSV Import/Export</h3> <p class="text-gray-600">Easily import your existing data from CSV files and export your portfolio data for external analysis or backup purposes.</p></div> <div class="text-center group"><div class="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">`);
  Calendar($$payload, { class: "h-8 w-8 text-orange-600" });
  $$payload.out.push(`<!----></div> <h3 class="text-xl font-semibold text-gray-900 mb-2">Time-based Filtering</h3> <p class="text-gray-600">Filter your data by specific time periods (7d, 30d, 60d, 3m, 1y) to analyze performance trends and identify patterns.</p></div> <div class="text-center group"><div class="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">`);
  Shield($$payload, { class: "h-8 w-8 text-red-600" });
  $$payload.out.push(`<!----></div> <h3 class="text-xl font-semibold text-gray-900 mb-2">Secure &amp; Private</h3> <p class="text-gray-600">Your financial data is stored securely with user authentication, ensuring your portfolio information remains private and protected.</p></div> <div class="text-center group"><div class="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">`);
  Dollar_sign($$payload, { class: "h-8 w-8 text-indigo-600" });
  $$payload.out.push(`<!----></div> <h3 class="text-xl font-semibold text-gray-900 mb-2">Mobile Responsive</h3> <p class="text-gray-600">Access your portfolio anywhere with our fully responsive design that works beautifully on desktop, tablet, and mobile devices.</p></div></div></div></section> <section id="benefits" class="py-20 bg-gray-50"><div class="container mx-auto px-6"><div class="grid lg:grid-cols-2 gap-12 items-center"><div><h2 class="text-4xl font-bold text-gray-900 mb-6">Why Choose Money Monitor?</h2> <div class="space-y-6"><div class="flex items-start space-x-4"><div class="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><div class="w-2 h-2 bg-green-600 rounded-full"></div></div> <div><h3 class="font-semibold text-gray-900 mb-1">Professional Grade Analytics</h3> <p class="text-gray-600">Get insights typically available only in expensive portfolio management software, completely free.</p></div></div> <div class="flex items-start space-x-4"><div class="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><div class="w-2 h-2 bg-blue-600 rounded-full"></div></div> <div><h3 class="font-semibold text-gray-900 mb-1">Easy Data Management</h3> <p class="text-gray-600">Simple interface for adding entries, bulk CSV imports, and exporting your data whenever you need it.</p></div></div> <div class="flex items-start space-x-4"><div class="bg-purple-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><div class="w-2 h-2 bg-purple-600 rounded-full"></div></div> <div><h3 class="font-semibold text-gray-900 mb-1">Privacy Focused</h3> <p class="text-gray-600">Your financial data stays yours. No third-party integrations or data sharing - complete privacy and control.</p></div></div></div></div> <div class="bg-white rounded-2xl shadow-xl p-8"><h3 class="text-2xl font-bold text-gray-900 mb-6">Start tracking in minutes</h3> <div class="space-y-4"><div class="flex items-center space-x-3"><div class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</div> <span class="text-gray-700">Create your free account</span></div> <div class="flex items-center space-x-3"><div class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</div> <span class="text-gray-700">Add your first investment entry</span></div> <div class="flex items-center space-x-3"><div class="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</div> <span class="text-gray-700">Watch your portfolio come to life</span></div></div></div></div></div></section> <section id="auth-section" class="py-20 bg-white"><div class="container mx-auto px-6"><div class="max-w-md mx-auto"><div class="bg-white rounded-2xl shadow-xl p-8"><div class="text-center mb-8"><h2 class="text-3xl font-bold text-gray-900 mb-2">${escape_html("Welcome Back")}</h2> <p class="text-gray-600">${escape_html("Sign in to your account")}</p></div> <form class="space-y-6">`);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div><label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label> <input type="email" id="email"${attr("value", email)} required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="your@email.com"/></div> <div><label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label> <input type="password" id="password"${attr("value", password)} required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="••••••••"/></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <button type="submit"${attr("disabled", loading, true)} class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">${escape_html("Sign In")}</button></form> <div class="mt-6 text-center"><button class="text-blue-600 hover:text-blue-700 font-medium">${escape_html("Don't have an account? Sign up")}</button></div> <div class="mt-6 p-4 bg-gray-50 rounded-lg"><h4 class="font-medium text-gray-900 mb-2">Demo Account (Dev Mode)</h4> <p class="text-sm text-gray-600 mb-2">Email: admin@moneymonitor.com</p> <p class="text-sm text-gray-600">Password: 123456</p></div></div></div></div></section> <footer class="bg-gray-900 text-white py-12"><div class="container mx-auto px-6 text-center"><div class="flex items-center justify-center space-x-2 mb-4">`);
  Trending_up($$payload, { class: "h-6 w-6" });
  $$payload.out.push(`<!----> <span class="text-xl font-bold">Money Monitor</span></div> <p class="text-gray-400">Professional investment tracking made simple and secure.</p></div></footer></div>`);
  pop();
}
export {
  _page as default
};
