import { P as sanitize_props, D as push, Q as spread_props, F as prevent_snippet_stringification, J as slot, G as pop, I as FILENAME, K as getContext, M as push_element, R as store_get, O as pop_element, N as escape_html, S as unsubscribe_stores, T as head } from "../../../chunks/index2.js";
import "../../../chunks/client.js";
import { I as Icon } from "../../../chunks/Icon.js";
import { F as Folder, C as Circle_alert, s as selectedPortfolio } from "../../../chunks/portfolio.js";
import { P as Plus } from "../../../chunks/plus.js";
import { T as Trending_up, C as Chart_column, a as ThemeToggle } from "../../../chunks/ThemeToggle.js";
Chevron_right[FILENAME] = "node_modules/lucide-svelte/dist/icons/chevron-right.svelte";
function Chevron_right($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(Chevron_right);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [["path", { "d": "m9 18 6-6-6-6" }]];
  Icon($$payload, spread_props([
    { name: "chevron-right" },
    $$sanitized_props,
    {
      /**
       * @component @name ChevronRight
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJtOSAxOCA2LTYtNi02IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/chevron-right
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
Chevron_right.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
House[FILENAME] = "node_modules/lucide-svelte/dist/icons/house.svelte";
function House($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(House);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    [
      "path",
      { "d": "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }
    ],
    [
      "path",
      {
        "d": "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "house" },
    $$sanitized_props,
    {
      /**
       * @component @name House
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUgMjF2LThhMSAxIDAgMCAwLTEtMWgtNGExIDEgMCAwIDAtMSAxdjgiIC8+CiAgPHBhdGggZD0iTTMgMTBhMiAyIDAgMCAxIC43MDktMS41MjhsNy01Ljk5OWEyIDIgMCAwIDEgMi41ODIgMGw3IDUuOTk5QTIgMiAwIDAgMSAyMSAxMHY5YTIgMiAwIDAgMS0yIDJINWEyIDIgMCAwIDEtMi0yeiIgLz4KPC9zdmc+Cg==) - https://lucide.dev/icons/house
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
House.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
Log_out[FILENAME] = "node_modules/lucide-svelte/dist/icons/log-out.svelte";
function Log_out($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(Log_out);
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
Log_out.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
Pen_line[FILENAME] = "node_modules/lucide-svelte/dist/icons/pen-line.svelte";
function Pen_line($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(Pen_line);
  /**
   * @license lucide-svelte v0.468.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   */
  const iconNode = [
    ["path", { "d": "M12 20h9" }],
    [
      "path",
      {
        "d": "M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"
      }
    ]
  ];
  Icon($$payload, spread_props([
    { name: "pen-line" },
    $$sanitized_props,
    {
      /**
       * @component @name PenLine
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTIgMjBoOSIgLz4KICA8cGF0aCBkPSJNMTYuMzc2IDMuNjIyYTEgMSAwIDAgMSAzLjAwMiAzLjAwMkw3LjM2OCAxOC42MzVhMiAyIDAgMCAxLS44NTUuNTA2bC0yLjg3Mi44MzhhLjUuNSAwIDAgMS0uNjItLjYybC44MzgtMi44NzJhMiAyIDAgMCAxIC41MDYtLjg1NHoiIC8+Cjwvc3ZnPgo=) - https://lucide.dev/icons/pen-line
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
Pen_line.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
User[FILENAME] = "node_modules/lucide-svelte/dist/icons/user.svelte";
function User($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(User);
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
User.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
Breadcrumb[FILENAME] = "src/lib/components/Breadcrumb.svelte";
function Breadcrumb($$payload, $$props) {
  push(Breadcrumb);
  var $$store_subs;
  let { selectedPortfolio: selectedPortfolio2 } = $$props;
  let isEditMode = () => {
    return store_get($$store_subs ??= {}, "$page", page).url.pathname === "/dashboard/add" && store_get($$store_subs ??= {}, "$page", page).url.searchParams.has("edit");
  };
  $$payload.out.push(`<nav class="flex mb-4 sm:mb-6" aria-label="Breadcrumb">`);
  push_element($$payload, "nav", 18, 0);
  $$payload.out.push(`<ol class="inline-flex items-center space-x-1 md:space-x-3 text-sm">`);
  push_element($$payload, "ol", 19, 2);
  $$payload.out.push(`<li class="inline-flex items-center">`);
  push_element($$payload, "li", 21, 4);
  if (store_get($$store_subs ??= {}, "$page", page).url.pathname === "/dashboard" && !selectedPortfolio2) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<span class="inline-flex items-center space-x-1 font-medium text-gray-500">`);
    push_element($$payload, "span", 23, 8);
    House($$payload, { class: "w-4 h-4" });
    $$payload.out.push(`<!----> <span>`);
    push_element($$payload, "span", 25, 10);
    $$payload.out.push(`Dashboard</span>`);
    pop_element();
    $$payload.out.push(`</span>`);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<a href="/dashboard" class="inline-flex items-center space-x-1 font-medium text-gray-700 hover:text-blue-600 transition-colors">`);
    push_element($$payload, "a", 28, 8);
    House($$payload, { class: "w-4 h-4" });
    $$payload.out.push(`<!----> <span>`);
    push_element($$payload, "span", 33, 10);
    $$payload.out.push(`Dashboard</span>`);
    pop_element();
    $$payload.out.push(`</a>`);
    pop_element();
  }
  $$payload.out.push(`<!--]--></li>`);
  pop_element();
  $$payload.out.push(` `);
  if (selectedPortfolio2) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<li class="inline-flex items-center">`);
    push_element($$payload, "li", 40, 6);
    Chevron_right($$payload, { class: "w-4 h-4 text-gray-400 mx-1 md:mx-2" });
    $$payload.out.push(`<!----> `);
    if (store_get($$store_subs ??= {}, "$page", page).url.pathname === "/dashboard") {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<span class="inline-flex items-center space-x-1 font-medium text-gray-500">`);
      push_element($$payload, "span", 43, 10);
      Folder($$payload, { class: "w-4 h-4 text-blue-600" });
      $$payload.out.push(`<!----> <div class="flex flex-col">`);
      push_element($$payload, "div", 45, 12);
      $$payload.out.push(`<span>`);
      push_element($$payload, "span", 46, 14);
      $$payload.out.push(`${escape_html(selectedPortfolio2.name)}</span>`);
      pop_element();
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(`</span>`);
      pop_element();
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<a href="/dashboard" class="inline-flex items-center space-x-1 font-medium text-gray-700 hover:text-blue-600 transition-colors">`);
      push_element($$payload, "a", 50, 10);
      Folder($$payload, { class: "w-4 h-4 text-blue-600" });
      $$payload.out.push(`<!----> <div class="flex flex-col">`);
      push_element($$payload, "div", 55, 12);
      $$payload.out.push(`<span>`);
      push_element($$payload, "span", 56, 14);
      $$payload.out.push(`${escape_html(selectedPortfolio2.name)}</span>`);
      pop_element();
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(`</a>`);
      pop_element();
    }
    $$payload.out.push(`<!--]--></li>`);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$page", page).url.pathname !== "/dashboard") {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<li class="inline-flex items-center">`);
      push_element($$payload, "li", 63, 6);
      Chevron_right($$payload, { class: "w-4 h-4 text-gray-400 mx-1 md:mx-2" });
      $$payload.out.push(`<!----> <span class="inline-flex items-center space-x-1 font-medium text-amber-600">`);
      push_element($$payload, "span", 65, 8);
      Circle_alert($$payload, { class: "w-4 h-4" });
      $$payload.out.push(`<!----> <div class="flex flex-col">`);
      push_element($$payload, "div", 67, 10);
      $$payload.out.push(`<span>`);
      push_element($$payload, "span", 68, 12);
      $$payload.out.push(`No Portfolio Selected</span>`);
      pop_element();
      $$payload.out.push(` <span class="text-xs text-amber-500 hidden sm:block">`);
      push_element($$payload, "span", 69, 12);
      $$payload.out.push(`Select a portfolio to continue</span>`);
      pop_element();
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(`</span>`);
      pop_element();
      $$payload.out.push(`</li>`);
      pop_element();
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--> `);
  if (store_get($$store_subs ??= {}, "$page", page).url.pathname === "/dashboard/add") {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<li class="inline-flex items-center">`);
    push_element($$payload, "li", 77, 6);
    Chevron_right($$payload, { class: "w-4 h-4 text-gray-400 mx-1 md:mx-2" });
    $$payload.out.push(`<!----> <span class="inline-flex items-center space-x-1 font-medium text-gray-500">`);
    push_element($$payload, "span", 79, 8);
    if (isEditMode()) {
      $$payload.out.push("<!--[-->");
      Pen_line($$payload, { class: "w-4 h-4" });
    } else {
      $$payload.out.push("<!--[!-->");
      Plus($$payload, { class: "w-4 h-4" });
    }
    $$payload.out.push(`<!--]--> <div class="flex flex-col">`);
    push_element($$payload, "div", 85, 10);
    $$payload.out.push(`<span>`);
    push_element($$payload, "span", 86, 12);
    $$payload.out.push(`${escape_html(isEditMode() ? "Edit Entry" : "Add Entry")}</span>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</span>`);
    pop_element();
    $$payload.out.push(`</li>`);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></ol>`);
  pop_element();
  $$payload.out.push(`</nav>`);
  pop_element();
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
Breadcrumb.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
_layout[FILENAME] = "src/routes/dashboard/+layout.svelte";
function _layout($$payload, $$props) {
  push(_layout);
  var $$store_subs;
  let { data, children } = $$props;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>Dashboard - Money Monitor</title>`;
  });
  $$payload.out.push(`<div class="min-h-screen bg-background-secondary">`);
  push_element($$payload, "div", 34, 0);
  $$payload.out.push(`<header class="sticky top-0 z-50 bg-background-primary shadow-sm border-b border-border-primary">`);
  push_element($$payload, "header", 36, 2);
  $$payload.out.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">`);
  push_element($$payload, "div", 37, 4);
  $$payload.out.push(`<div class="flex justify-between h-16">`);
  push_element($$payload, "div", 38, 6);
  $$payload.out.push(`<div class="flex items-center">`);
  push_element($$payload, "div", 39, 8);
  $$payload.out.push(`<div class="flex-shrink-0 flex items-center">`);
  push_element($$payload, "div", 40, 10);
  Trending_up($$payload, { class: "h-6 w-6 sm:h-8 sm:w-8 text-accent-primary" });
  $$payload.out.push(`<!----> <span class="ml-2 text-lg sm:text-xl font-bold text-foreground-primary">`);
  push_element($$payload, "span", 42, 12);
  $$payload.out.push(`Money Monitor</span>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` <nav class="hidden md:ml-6 md:flex md:space-x-8">`);
  push_element($$payload, "nav", 44, 10);
  $$payload.out.push(`<a href="/dashboard" class="nav-link-active flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors group">`);
  push_element($$payload, "a", 45, 12);
  Chart_column($$payload, { class: "h-4 w-4 group-hover:scale-110 transition-transform" });
  $$payload.out.push(`<!----> <span>`);
  push_element($$payload, "span", 50, 14);
  $$payload.out.push(`Dashboard</span>`);
  pop_element();
  $$payload.out.push(`</a>`);
  pop_element();
  $$payload.out.push(` <a href="/dashboard/add" class="nav-link flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors group">`);
  push_element($$payload, "a", 52, 12);
  Plus($$payload, { class: "h-4 w-4 group-hover:scale-110 transition-transform" });
  $$payload.out.push(`<!----> <span>`);
  push_element($$payload, "span", 57, 14);
  $$payload.out.push(`Add Entry</span>`);
  pop_element();
  $$payload.out.push(`</a>`);
  pop_element();
  $$payload.out.push(`</nav>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` <div class="flex items-center space-x-2 sm:space-x-4">`);
  push_element($$payload, "div", 62, 8);
  $$payload.out.push(`<div class="no-print">`);
  push_element($$payload, "div", 64, 10);
  ThemeToggle($$payload, { variant: "button", size: "md" });
  $$payload.out.push(`<!----></div>`);
  pop_element();
  $$payload.out.push(` <div class="flex items-center space-x-2 sm:space-x-3">`);
  push_element($$payload, "div", 68, 10);
  User($$payload, { class: "h-5 w-5 text-foreground-tertiary" });
  $$payload.out.push(`<!----> <span class="text-sm font-medium text-foreground-secondary truncate max-w-[120px] sm:max-w-none">`);
  push_element($$payload, "span", 70, 12);
  $$payload.out.push(`${escape_html(data.user.name || data.user.email)}</span>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` <button class="flex items-center space-x-1 sm:space-x-2 text-foreground-tertiary hover:text-foreground-primary px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">`);
  push_element($$payload, "button", 74, 10);
  Log_out($$payload, { class: "h-4 w-4" });
  $$payload.out.push(`<!----> <span class="hidden sm:inline">`);
  push_element($$payload, "span", 79, 12);
  $$payload.out.push(`Sign Out</span>`);
  pop_element();
  $$payload.out.push(`</button>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(`</header>`);
  pop_element();
  $$payload.out.push(` <main class="max-w-7xl mx-auto pt-4 sm:pt-6 pb-12 sm:px-6 lg:px-8">`);
  push_element($$payload, "main", 87, 2);
  $$payload.out.push(`<div class="px-4 py-4 sm:py-6 sm:px-0">`);
  push_element($$payload, "div", 88, 4);
  Breadcrumb($$payload, {
    selectedPortfolio: store_get($$store_subs ??= {}, "$selectedPortfolio", selectedPortfolio)
  });
  $$payload.out.push(`<!----> `);
  children($$payload);
  $$payload.out.push(`<!----></div>`);
  pop_element();
  $$payload.out.push(`</main>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
_layout.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  _layout as default
};
