import { P as sanitize_props, D as push, Q as spread_props, F as prevent_snippet_stringification, G as pop, I as FILENAME, J as slot, V as fallback, R as store_get, W as attr_class, U as attr, M as push_element, O as pop_element, N as escape_html, S as unsubscribe_stores, X as bind_props, Y as stringify } from "./index2.js";
import { I as Icon } from "./Icon.js";
import { t as themeStore, g as getNextThemeLabel, a as getThemeLabel } from "./theme.js";
Chart_column[FILENAME] = "node_modules/lucide-svelte/dist/icons/chart-column.svelte";
function Chart_column($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(Chart_column);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M3 3v16a2 2 0 0 0 2 2h16" }],
    ["path", { "d": "M18 17V9" }],
    ["path", { "d": "M13 17V5" }],
    ["path", { "d": "M8 17v-3" }]
  ];
  Icon($$payload, spread_props([
    { name: "chart-column" },
    $$sanitized_props,
    {
      /**
       * @component @name ChartColumn
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMyAzdjE2YTIgMiAwIDAgMCAyIDJoMTYiIC8+CiAgPHBhdGggZD0iTTE4IDE3VjkiIC8+CiAgPHBhdGggZD0iTTEzIDE3VjUiIC8+CiAgPHBhdGggZD0iTTggMTd2LTMiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/chart-column
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: prevent_snippet_stringification(($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      }),
      $$slots: { default: true }
    }
  ]));
  pop();
}
Chart_column.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
Monitor[FILENAME] = "node_modules/lucide-svelte/dist/icons/monitor.svelte";
function Monitor($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(Monitor);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "rect",
      { "width": "20", "height": "14", "x": "2", "y": "3", "rx": "2" }
    ],
    ["line", { "x1": "8", "x2": "16", "y1": "21", "y2": "21" }],
    ["line", { "x1": "12", "x2": "12", "y1": "17", "y2": "21" }]
  ];
  Icon($$payload, spread_props([
    { name: "monitor" },
    $$sanitized_props,
    {
      /**
       * @component @name Monitor
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTQiIHg9IjIiIHk9IjMiIHJ4PSIyIiAvPgogIDxsaW5lIHgxPSI4IiB4Mj0iMTYiIHkxPSIyMSIgeTI9IjIxIiAvPgogIDxsaW5lIHgxPSIxMiIgeDI9IjEyIiB5MT0iMTciIHkyPSIyMSIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/monitor
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: prevent_snippet_stringification(($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      }),
      $$slots: { default: true }
    }
  ]));
  pop();
}
Monitor.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
Moon[FILENAME] = "node_modules/lucide-svelte/dist/icons/moon.svelte";
function Moon($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(Moon);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [["path", { "d": "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" }]];
  Icon($$payload, spread_props([
    { name: "moon" },
    $$sanitized_props,
    {
      /**
       * @component @name Moon
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgM2E2IDYgMCAwIDAgOSA5IDkgOSAwIDEgMS05LTlaIiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/moon
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: prevent_snippet_stringification(($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      }),
      $$slots: { default: true }
    }
  ]));
  pop();
}
Moon.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
Sun[FILENAME] = "node_modules/lucide-svelte/dist/icons/sun.svelte";
function Sun($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(Sun);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["circle", { "cx": "12", "cy": "12", "r": "4" }],
    ["path", { "d": "M12 2v2" }],
    ["path", { "d": "M12 20v2" }],
    ["path", { "d": "m4.93 4.93 1.41 1.41" }],
    ["path", { "d": "m17.66 17.66 1.41 1.41" }],
    ["path", { "d": "M2 12h2" }],
    ["path", { "d": "M20 12h2" }],
    ["path", { "d": "m6.34 17.66-1.41 1.41" }],
    ["path", { "d": "m19.07 4.93-1.41 1.41" }]
  ];
  Icon($$payload, spread_props([
    { name: "sun" },
    $$sanitized_props,
    {
      /**
       * @component @name Sun
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI0IiAvPgogIDxwYXRoIGQ9Ik0xMiAydjIiIC8+CiAgPHBhdGggZD0iTTEyIDIwdjIiIC8+CiAgPHBhdGggZD0ibTQuOTMgNC45MyAxLjQxIDEuNDEiIC8+CiAgPHBhdGggZD0ibTE3LjY2IDE3LjY2IDEuNDEgMS40MSIgLz4KICA8cGF0aCBkPSJNMiAxMmgyIiAvPgogIDxwYXRoIGQ9Ik0yMCAxMmgyIiAvPgogIDxwYXRoIGQ9Im02LjM0IDE3LjY2LTEuNDEgMS40MSIgLz4KICA8cGF0aCBkPSJtMTkuMDcgNC45My0xLjQxIDEuNDEiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/sun
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: prevent_snippet_stringification(($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      }),
      $$slots: { default: true }
    }
  ]));
  pop();
}
Sun.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
Trending_up[FILENAME] = "node_modules/lucide-svelte/dist/icons/trending-up.svelte";
function Trending_up($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(Trending_up);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["polyline", { "points": "22 7 13.5 15.5 8.5 10.5 2 17" }],
    ["polyline", { "points": "16 7 22 7 22 13" }]
  ];
  Icon($$payload, spread_props([
    { name: "trending-up" },
    $$sanitized_props,
    {
      /**
       * @component @name TrendingUp
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSIyMiA3IDEzLjUgMTUuNSA4LjUgMTAuNSAyIDE3IiAvPgogIDxwb2x5bGluZSBwb2ludHM9IjE2IDcgMjIgNyAyMiAxMyIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/trending-up
       * @see https://lucide.dev/guide/packages/lucide-svelte - Documentation
       *
       * @param {Object} props - Lucide icons props and any valid SVG attribute
       * @returns {FunctionalComponent} Svelte component
       *
       */
      iconNode,
      children: prevent_snippet_stringification(($$payload2) => {
        $$payload2.out.push(`<!---->`);
        slot($$payload2, $$props, "default", {});
        $$payload2.out.push(`<!---->`);
      }),
      $$slots: { default: true }
    }
  ]));
  pop();
}
Trending_up.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
ThemeToggle[FILENAME] = "src/lib/components/ThemeToggle.svelte";
function ThemeToggle($$payload, $$props) {
  push(ThemeToggle);
  var $$store_subs;
  let theme, resolvedTheme, sizeClasses, iconSize, ThemeIcon;
  let showLabel = fallback($$props["showLabel"], false);
  let size = fallback($$props["size"], "md");
  let variant = fallback($$props["variant"], "button");
  let dropdownOpen = false;
  let dropdownMenu;
  const handleDropdownKeydown = (event) => {
    if (event.key === "Escape") {
      dropdownOpen = false;
    }
  };
  const handleClickOutside = (event) => {
    if (dropdownOpen && dropdownMenu && !dropdownMenu.contains(event.target) && true) {
      dropdownOpen = false;
    }
  };
  const transitionClasses = "transition-all duration-200 ease-in-out";
  const hoverClasses = "hover:bg-background-secondary hover:scale-105";
  const focusClasses = "focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-background-primary";
  const activeClasses = "active:scale-95";
  theme = store_get($$store_subs ??= {}, "$themeStore", themeStore).theme;
  resolvedTheme = store_get($$store_subs ??= {}, "$themeStore", themeStore).resolvedTheme;
  sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg"
  }[size];
  iconSize = { sm: 16, md: 20, lg: 24 }[size];
  if (typeof window !== "undefined") {
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleDropdownKeydown);
    } else {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleDropdownKeydown);
    }
  }
  ThemeIcon = theme === "system" ? Monitor : theme === "dark" ? Moon : Sun;
  if (
    // Animation classes
    variant === "button"
  ) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<button type="button"${attr_class(` ${stringify(sizeClasses)} ${stringify(transitionClasses)} ${stringify(hoverClasses)} ${stringify(focusClasses)} ${stringify(activeClasses)} inline-flex items-center justify-center rounded-lg bg-background-secondary text-foreground-primary border border-border-primary shadow-sm relative overflow-hidden group `, "svelte-iet0q5")}${attr("aria-label", getNextThemeLabel(theme, resolvedTheme))}${attr("title", getNextThemeLabel(theme, resolvedTheme))}>`);
    push_element($$payload, "button", 102, 2);
    $$payload.out.push(`<div${attr_class(`relative ${stringify(transitionClasses)} group-hover:rotate-12`, "svelte-iet0q5")}>`);
    push_element($$payload, "div", 125, 4);
    $$payload.out.push(`<!---->`);
    ThemeIcon?.($$payload, { size: iconSize, class: "drop-shadow-sm" });
    $$payload.out.push(`<!----></div>`);
    pop_element();
    $$payload.out.push(` `);
    if (showLabel) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<span class="ml-2 text-sm font-medium">`);
      push_element($$payload, "span", 135, 6);
      $$payload.out.push(`${escape_html(getThemeLabel(theme))}</span>`);
      pop_element();
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--> <div class="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out">`);
    push_element($$payload, "div", 141, 4);
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</button>`);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
    if (variant === "dropdown") {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="relative">`);
      push_element($$payload, "div", 151, 2);
      $$payload.out.push(`<button type="button"${attr_class(` ${stringify(sizeClasses)} ${stringify(transitionClasses)} ${stringify(hoverClasses)} ${stringify(focusClasses)} ${stringify(activeClasses)} inline-flex items-center justify-center rounded-lg bg-background-secondary text-foreground-primary border border-border-primary shadow-sm relative group `, "svelte-iet0q5")} aria-label="Theme options"${attr("aria-expanded", dropdownOpen)} aria-haspopup="menu" title="Change theme">`);
      push_element($$payload, "button", 152, 4);
      $$payload.out.push(`<div${attr_class(`relative ${stringify(transitionClasses)} group-hover:rotate-12`, "svelte-iet0q5")}>`);
      push_element($$payload, "div", 176, 6);
      $$payload.out.push(`<!---->`);
      ThemeIcon?.($$payload, { size: iconSize, class: "drop-shadow-sm" });
      $$payload.out.push(`<!----></div>`);
      pop_element();
      $$payload.out.push(` `);
      if (showLabel) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<span class="ml-2 text-sm font-medium">`);
        push_element($$payload, "span", 185, 8);
        $$payload.out.push(`${escape_html(getThemeLabel(theme))}</span>`);
        pop_element();
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--></button>`);
      pop_element();
      $$payload.out.push(` `);
      if (dropdownOpen) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="absolute right-0 mt-2 w-48 bg-background-primary border border-border-primary rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10 z-50 animate-in slide-in-from-top-2 duration-200 svelte-iet0q5" role="menu" aria-orientation="vertical" aria-labelledby="theme-menu">`);
        push_element($$payload, "div", 193, 6);
        $$payload.out.push(`<div class="p-1">`);
        push_element($$payload, "div", 209, 8);
        $$payload.out.push(`<button type="button"${attr_class(` w-full px-3 py-2 text-left text-sm text-foreground-primary rounded-md ${stringify(transitionClasses)} hover:bg-background-secondary focus:bg-background-secondary focus:outline-none flex items-center gap-3 ${stringify(theme === "light" ? "bg-background-secondary" : "")} `, "svelte-iet0q5")} role="menuitem"${attr("aria-current", theme === "light" ? "true" : "false")}>`);
        push_element($$payload, "button", 211, 10);
        Sun($$payload, { size: 16, class: "text-amber-500" });
        $$payload.out.push(`<!----> <span>`);
        push_element($$payload, "span", 230, 12);
        $$payload.out.push(`Light</span>`);
        pop_element();
        $$payload.out.push(` `);
        if (theme === "light") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<div class="ml-auto w-2 h-2 bg-accent-primary rounded-full">`);
          push_element($$payload, "div", 232, 14);
          $$payload.out.push(`</div>`);
          pop_element();
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></button>`);
        pop_element();
        $$payload.out.push(` <button type="button"${attr_class(` w-full px-3 py-2 text-left text-sm text-foreground-primary rounded-md ${stringify(transitionClasses)} hover:bg-background-secondary focus:bg-background-secondary focus:outline-none flex items-center gap-3 ${stringify(theme === "dark" ? "bg-background-secondary" : "")} `, "svelte-iet0q5")} role="menuitem"${attr("aria-current", theme === "dark" ? "true" : "false")}>`);
        push_element($$payload, "button", 237, 10);
        Moon($$payload, { size: 16, class: "text-blue-400" });
        $$payload.out.push(`<!----> <span>`);
        push_element($$payload, "span", 256, 12);
        $$payload.out.push(`Dark</span>`);
        pop_element();
        $$payload.out.push(` `);
        if (theme === "dark") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<div class="ml-auto w-2 h-2 bg-accent-primary rounded-full">`);
          push_element($$payload, "div", 258, 14);
          $$payload.out.push(`</div>`);
          pop_element();
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></button>`);
        pop_element();
        $$payload.out.push(` <button type="button"${attr_class(` w-full px-3 py-2 text-left text-sm text-foreground-primary rounded-md ${stringify(transitionClasses)} hover:bg-background-secondary focus:bg-background-secondary focus:outline-none flex items-center gap-3 ${stringify(theme === "system" ? "bg-background-secondary" : "")} `, "svelte-iet0q5")} role="menuitem"${attr("aria-current", theme === "system" ? "true" : "false")}>`);
        push_element($$payload, "button", 263, 10);
        Monitor($$payload, { size: 16, class: "text-slate-500" });
        $$payload.out.push(`<!----> <span>`);
        push_element($$payload, "span", 282, 12);
        $$payload.out.push(`System</span>`);
        pop_element();
        $$payload.out.push(` `);
        if (theme === "system") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<div class="ml-auto w-2 h-2 bg-accent-primary rounded-full">`);
          push_element($$payload, "div", 284, 14);
          $$payload.out.push(`</div>`);
          pop_element();
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></button>`);
        pop_element();
        $$payload.out.push(`</div>`);
        pop_element();
        $$payload.out.push(` `);
        if (theme === "system") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<div class="border-t border-border-primary p-2">`);
          push_element($$payload, "div", 291, 10);
          $$payload.out.push(`<div class="text-xs text-foreground-tertiary flex items-center gap-2">`);
          push_element($$payload, "div", 292, 12);
          $$payload.out.push(`<div class="w-1.5 h-1.5 bg-accent-primary rounded-full animate-pulse">`);
          push_element($$payload, "div", 293, 14);
          $$payload.out.push(`</div>`);
          pop_element();
          $$payload.out.push(` Currently: ${escape_html(resolvedTheme === "dark" ? "Dark" : "Light")}</div>`);
          pop_element();
          $$payload.out.push(`</div>`);
          pop_element();
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></div>`);
        pop_element();
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--></div>`);
      pop_element();
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  bind_props($$props, { showLabel, size, variant });
  pop();
}
ThemeToggle.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  Chart_column as C,
  Trending_up as T,
  ThemeToggle as a
};
