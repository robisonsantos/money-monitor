import { Y as sanitize_props, Z as spread_props, T as slot, _ as head, W as escape_html, Q as pop, O as push } from "../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../chunks/exports.js";
import "clsx";
import "../../../chunks/state.svelte.js";
import { T as Trending_up, C as Chart_column } from "../../../chunks/trending-up.js";
import { P as Plus } from "../../../chunks/plus.js";
import { I as Icon } from "../../../chunks/Icon.js";
function Log_out($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
    ["polyline", { "points": "16 17 21 12 16 7" }],
    ["line", { "x1": "21", "x2": "9", "y1": "12", "y2": "12" }]
  ];
  Icon($$payload, spread_props([
    { name: "log-out" },
    $$sanitized_props,
    {
      /**
       * @component @name LogOut
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNOSAyMUg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDQiIC8+CiAgPHBvbHlsaW5lIHBvaW50cz0iMTYgMTcgMjEgMTIgMTYgNyIgLz4KICA8bGluZSB4MT0iMjEiIHgyPSI5IiB5MT0iMTIiIHkyPSIxMiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/log-out
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
function User($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }],
    ["circle", { "cx": "12", "cy": "7", "r": "4" }]
  ];
  Icon($$payload, spread_props([
    { name: "user" },
    $$sanitized_props,
    {
      /**
       * @component @name User
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTkgMjF2LTJhNCA0IDAgMCAwLTQtNEg5YTQgNCAwIDAgMC00IDR2MiIgLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/user
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
function _layout($$payload, $$props) {
  push();
  let { data, children } = $$props;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Dashboard - Money Monitor</title>`;
  });
  $$payload.out.push(`<div class="min-h-screen bg-gray-50"><header class="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between h-16"><div class="flex items-center"><div class="flex-shrink-0 flex items-center">`);
  Trending_up($$payload, { class: "h-6 w-6 sm:h-8 sm:w-8 text-blue-600" });
  $$payload.out.push(`<!----> <span class="ml-2 text-lg sm:text-xl font-bold text-gray-900">Money Monitor</span></div> <nav class="hidden md:ml-6 md:flex md:space-x-8"><a href="/dashboard" class="flex items-center space-x-2 text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium transition-colors group">`);
  Chart_column($$payload, { class: "h-4 w-4 group-hover:scale-110 transition-transform" });
  $$payload.out.push(`<!----> <span>Dashboard</span></a> <a href="/dashboard/add" class="flex items-center space-x-2 text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors group">`);
  Plus($$payload, { class: "h-4 w-4 group-hover:scale-110 transition-transform" });
  $$payload.out.push(`<!----> <span>Add Entry</span></a></nav></div> <div class="flex items-center space-x-2 sm:space-x-4"><div class="flex items-center space-x-2 sm:space-x-3">`);
  User($$payload, { class: "h-5 w-5 text-gray-400" });
  $$payload.out.push(`<!----> <span class="text-sm font-medium text-gray-700 truncate max-w-[120px] sm:max-w-none">${escape_html(data.user.name || data.user.email)}</span></div> <button class="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-gray-700 px-2 sm:px-3 py-2 rounded-md text-sm font-medium">`);
  Log_out($$payload, { class: "h-4 w-4" });
  $$payload.out.push(`<!----> <span class="hidden sm:inline">Sign Out</span></button></div></div></div></header> <main class="max-w-7xl mx-auto pt-4 sm:pt-6 pb-12 sm:px-6 lg:px-8"><div class="px-4 py-4 sm:py-6 sm:px-0">`);
  children($$payload);
  $$payload.out.push(`<!----></div></main></div>`);
  pop();
}
export {
  _layout as default
};
