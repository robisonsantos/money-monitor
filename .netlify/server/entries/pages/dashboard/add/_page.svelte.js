import { P as sanitize_props, D as push, Q as spread_props, F as prevent_snippet_stringification, G as pop, I as FILENAME, J as slot, M as push_element, W as attr_class, U as attr, O as pop_element, N as escape_html, Y as stringify, T as head, R as store_get, S as unsubscribe_stores } from "../../../../chunks/index2.js";
import "../../../../chunks/client.js";
import { format, getDay, addDays } from "date-fns";
import { f as formatDate } from "../../../../chunks/utils.js";
import { F as Folder, C as Circle_alert, p as portfolioIsLoading, a as portfolios, b as portfolioError } from "../../../../chunks/portfolio.js";
import { C as Chevron_down } from "../../../../chunks/chevron-down.js";
import { P as Plus } from "../../../../chunks/plus.js";
import { C as Calendar } from "../../../../chunks/calendar.js";
import { I as Icon } from "../../../../chunks/Icon.js";
Save[FILENAME] = "node_modules/lucide-svelte/dist/icons/save.svelte";
function Save($$payload, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  push(Save);
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
        "d": "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
      }
    ],
    ["path", { "d": "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" }],
    ["path", { "d": "M7 3v4a1 1 0 0 0 1 1h7" }]
  ];
  Icon($$payload, spread_props([
    { name: "save" },
    $$sanitized_props,
    {
      /**
       * @component @name Save
       * @description Lucide SVG icon component, renders SVG Element with children.
       *
       * @preview ![img](data:image/svg+xml;base64,PHN2ZyAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogIHdpZHRoPSIyNCIKICBoZWlnaHQ9IjI0IgogIHZpZXdCb3g9IjAgMCAyNCAyNCIKICBmaWxsPSJub25lIgogIHN0cm9rZT0iIzAwMCIgc3R5bGU9ImJhY2tncm91bmQtY29sb3I6ICNmZmY7IGJvcmRlci1yYWRpdXM6IDJweCIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cGF0aCBkPSJNMTUuMiAzYTIgMiAwIDAgMSAxLjQuNmwzLjggMy44YTIgMiAwIDAgMSAuNiAxLjRWMTlhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yeiIgLz4KICA8cGF0aCBkPSJNMTcgMjF2LTdhMSAxIDAgMCAwLTEtMUg4YTEgMSAwIDAgMC0xIDF2NyIgLz4KICA8cGF0aCBkPSJNNyAzdjRhMSAxIDAgMCAwIDEgMWg3IiAvPgo8L3N2Zz4K) - https://lucide.dev/icons/save
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
Save.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
PortfolioSelector[FILENAME] = "src/lib/components/PortfolioSelector.svelte";
function PortfolioSelector($$payload, $$props) {
  push(PortfolioSelector);
  let {
    portfolios: portfolios2,
    selectedPortfolio,
    isLoading = false,
    disabled = false
  } = $$props;
  let isDropdownOpen = false;
  $$payload.out.push(`<div class="relative svelte-164aekf">`);
  push_element($$payload, "div", 138, 0);
  $$payload.out.push(`<button${attr_class(`flex items-center justify-between w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${stringify(disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}`, void 0, {
    "ring-2": isDropdownOpen,
    "ring-blue-500": isDropdownOpen,
    "border-blue-500": isDropdownOpen
  })}${attr("disabled", disabled, true)}>`);
  push_element($$payload, "button", 139, 2);
  $$payload.out.push(`<div class="flex items-center min-w-0 flex-1">`);
  push_element($$payload, "div", 149, 4);
  Folder($$payload, { class: "w-5 h-5 text-gray-400 mr-3 flex-shrink-0" });
  $$payload.out.push(`<!----> <div class="min-w-0 flex-1">`);
  push_element($$payload, "div", 151, 6);
  if (isLoading) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="animate-pulse">`);
    push_element($$payload, "div", 153, 10);
    $$payload.out.push(`<div class="h-4 bg-gray-200 rounded w-24">`);
    push_element($$payload, "div", 154, 12);
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
    if (selectedPortfolio) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<span class="block text-sm font-medium text-gray-900 truncate">`);
      push_element($$payload, "span", 157, 10);
      $$payload.out.push(`${escape_html(selectedPortfolio.name)}</span>`);
      pop_element();
      $$payload.out.push(` <span class="block text-xs text-gray-500 truncate">`);
      push_element($$payload, "span", 160, 10);
      $$payload.out.push(`Portfolio</span>`);
      pop_element();
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<span class="block text-sm text-gray-500">`);
      push_element($$payload, "span", 162, 10);
      $$payload.out.push(`Select portfolio...</span>`);
      pop_element();
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` `);
  Chevron_down($$payload, {
    class: `w-4 h-4 text-gray-400 ml-2 flex-shrink-0 transition-transform ${stringify("")}`
  });
  $$payload.out.push(`<!----></button>`);
  pop_element();
  $$payload.out.push(` `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  pop_element();
  pop();
}
PortfolioSelector.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
_page[FILENAME] = "src/routes/dashboard/add/+page.svelte";
function _page($$payload, $$props) {
  push(_page);
  var $$store_subs;
  let date = format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
  let value = "";
  let isLoading = false;
  let isEditMode = false;
  let carryOverWeekend = false;
  let currentPortfolio = null;
  const isFriday = () => {
    if (!date) return false;
    const selectedDate = /* @__PURE__ */ new Date(date + "T00:00:00");
    return getDay(selectedDate) === 5;
  };
  const weekendDates = () => {
    if (!isFriday()) return { saturday: "", sunday: "" };
    const fridayDate = /* @__PURE__ */ new Date(date + "T00:00:00");
    const saturday = addDays(fridayDate, 1);
    const sunday = addDays(fridayDate, 2);
    return {
      saturday: format(saturday, "yyyy-MM-dd"),
      sunday: format(sunday, "yyyy-MM-dd")
    };
  };
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html("Add Entry")} - Money Monitor</title>`;
  });
  $$payload.out.push(`<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 -mx-4 -my-6 px-4 py-8 sm:px-6 sm:py-12">`);
  push_element($$payload, "div", 265, 0);
  $$payload.out.push(`<div class="max-w-2xl mx-auto">`);
  push_element($$payload, "div", 266, 2);
  $$payload.out.push(`<div class="text-center mb-10">`);
  push_element($$payload, "div", 268, 4);
  $$payload.out.push(`<div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">`);
  push_element($$payload, "div", 269, 6);
  {
    $$payload.out.push("<!--[!-->");
    Plus($$payload, { class: "w-8 h-8 text-blue-600" });
  }
  $$payload.out.push(`<!--]--></div>`);
  pop_element();
  $$payload.out.push(` <h1 class="text-4xl font-bold text-gray-900 mb-3">`);
  push_element($$payload, "h1", 276, 6);
  $$payload.out.push(`${escape_html("Add Investment Entry")}</h1>`);
  pop_element();
  $$payload.out.push(` <p class="text-lg text-gray-600 max-w-md mx-auto">`);
  push_element($$payload, "p", 279, 6);
  $$payload.out.push(`${escape_html("Record your portfolio value for a specific date")}</p>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">`);
  push_element($$payload, "div", 285, 4);
  $$payload.out.push(`<div class="p-8 sm:p-10">`);
  push_element($$payload, "div", 287, 6);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <form class="space-y-8">`);
  push_element($$payload, "form", 336, 8);
  $$payload.out.push(`<div>`);
  push_element($$payload, "div", 344, 10);
  $$payload.out.push(`<label class="block text-sm font-semibold text-gray-800 mb-3">`);
  push_element($$payload, "label", 345, 12);
  Folder($$payload, { class: "w-4 h-4 inline mr-1" });
  $$payload.out.push(`<!----> Portfolio</label>`);
  pop_element();
  $$payload.out.push(` `);
  if (store_get($$store_subs ??= {}, "$portfolioIsLoading", portfolioIsLoading)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="animate-pulse">`);
    push_element($$payload, "div", 350, 14);
    $$payload.out.push(`<div class="h-12 bg-gray-200 rounded-xl">`);
    push_element($$payload, "div", 351, 16);
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
    if (store_get($$store_subs ??= {}, "$portfolios", portfolios).length > 0) {
      $$payload.out.push("<!--[-->");
      PortfolioSelector($$payload, {
        portfolios: store_get($$store_subs ??= {}, "$portfolios", portfolios),
        selectedPortfolio: currentPortfolio,
        disabled: isLoading
      });
      $$payload.out.push(`<!----> `);
      if (store_get($$store_subs ??= {}, "$portfolioError", portfolioError)) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<p class="text-sm text-red-600 mt-2">`);
        push_element($$payload, "p", 369, 16);
        Circle_alert($$payload, { class: "w-4 h-4 inline mr-1" });
        $$payload.out.push(`<!----> ${escape_html(store_get($$store_subs ??= {}, "$portfolioError", portfolioError))}</p>`);
        pop_element();
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]-->`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">`);
      push_element($$payload, "div", 375, 14);
      $$payload.out.push(`<p class="text-yellow-800 text-sm">`);
      push_element($$payload, "p", 376, 16);
      Circle_alert($$payload, { class: "w-4 h-4 inline mr-1" });
      $$payload.out.push(`<!----> No portfolios found. A "Main Portfolio" will be created automatically.</p>`);
      pop_element();
      $$payload.out.push(`</div>`);
      pop_element();
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--> <p class="text-sm text-gray-500 mt-3">`);
  push_element($$payload, "p", 382, 12);
  $$payload.out.push(`Select the portfolio to add this investment entry to</p>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` <div>`);
  push_element($$payload, "div", 385, 10);
  $$payload.out.push(`<label for="date" class="block text-sm font-semibold text-gray-800 mb-3">`);
  push_element($$payload, "label", 386, 12);
  $$payload.out.push(`Date</label>`);
  pop_element();
  $$payload.out.push(` <input id="date" type="date"${attr("value", date)}${attr_class(`w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${stringify("bg-white")}`)} required${attr("disabled", isEditMode, true)}${attr("readonly", isEditMode, true)}/>`);
  push_element($$payload, "input", 387, 12);
  pop_element();
  $$payload.out.push(` `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <p class="text-sm text-gray-500 mt-3">`);
  push_element($$payload, "p", 404, 12);
  $$payload.out.push(`${escape_html("Select the date for this investment value")}</p>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` <div>`);
  push_element($$payload, "div", 411, 10);
  $$payload.out.push(`<label for="value" class="block text-sm font-semibold text-gray-800 mb-3">`);
  push_element($$payload, "label", 412, 12);
  $$payload.out.push(`Portfolio Value ($)</label>`);
  pop_element();
  $$payload.out.push(` <div class="relative">`);
  push_element($$payload, "div", 413, 12);
  $$payload.out.push(`<div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">`);
  push_element($$payload, "div", 414, 14);
  $$payload.out.push(`<span class="text-gray-500 text-lg font-medium">`);
  push_element($$payload, "span", 415, 16);
  $$payload.out.push(`$</span>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` <input id="value" type="number" step="0.01" min="0"${attr("value", value)} class="w-full pl-8 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"${attr("placeholder", "0.00")} required${attr("disabled", isLoading, true)}/>`);
  push_element($$payload, "input", 417, 14);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` <p class="text-sm text-gray-500 mt-3">`);
  push_element($$payload, "p", 430, 12);
  $$payload.out.push(`Enter the total value of your investment portfolio</p>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` `);
  if (isFriday()) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="bg-blue-50 border border-blue-200 rounded-xl p-6">`);
    push_element($$payload, "div", 434, 12);
    $$payload.out.push(`<div class="flex items-start">`);
    push_element($$payload, "div", 435, 14);
    $$payload.out.push(`<div class="flex items-center h-5 mr-4 mt-0.5">`);
    push_element($$payload, "div", 436, 16);
    $$payload.out.push(`<input id="carryOverWeekend" type="checkbox"${attr("checked", carryOverWeekend, true)} class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"${attr("disabled", isLoading, true)}/>`);
    push_element($$payload, "input", 437, 18);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(` <div class="flex-1">`);
    push_element($$payload, "div", 445, 16);
    $$payload.out.push(`<label for="carryOverWeekend" class="block text-sm font-medium text-blue-900 mb-2 cursor-pointer">`);
    push_element($$payload, "label", 446, 18);
    Calendar($$payload, { class: "w-4 h-4 inline mr-2" });
    $$payload.out.push(`<!----> Copy this value to weekend days</label>`);
    pop_element();
    $$payload.out.push(` <p class="text-sm text-blue-700 mb-3">`);
    push_element($$payload, "p", 450, 18);
    $$payload.out.push(`Since markets are closed on weekends, this will also save the same value for:</p>`);
    pop_element();
    $$payload.out.push(` <div class="flex flex-col sm:flex-row gap-2 text-sm">`);
    push_element($$payload, "div", 453, 18);
    $$payload.out.push(`<span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">`);
    push_element($$payload, "span", 454, 20);
    $$payload.out.push(`📅 Saturday: ${escape_html(formatDate(weekendDates().saturday))}</span>`);
    pop_element();
    $$payload.out.push(` <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">`);
    push_element($$payload, "span", 457, 20);
    $$payload.out.push(`📅 Sunday: ${escape_html(formatDate(weekendDates().sunday))}</span>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div class="flex flex-col sm:flex-row items-center gap-4 pt-6">`);
  push_element($$payload, "div", 466, 10);
  $$payload.out.push(`<button type="submit" class="w-full sm:w-auto btn-primary flex items-center justify-center space-x-3 px-8 py-4 text-lg font-semibold rounded-xl"${attr("disabled", false, true)}>`);
  push_element($$payload, "button", 467, 12);
  {
    $$payload.out.push("<!--[!-->");
    {
      $$payload.out.push("<!--[!-->");
      Save($$payload, { class: "w-5 h-5" });
      $$payload.out.push(`<!----> <span>`);
      push_element($$payload, "span", 480, 16);
      $$payload.out.push(`Save Entry</span>`);
      pop_element();
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></button>`);
  pop_element();
  $$payload.out.push(` <a href="/dashboard" class="w-full sm:w-auto btn-secondary px-8 py-4 text-lg font-semibold rounded-xl text-center">`);
  push_element($$payload, "a", 484, 12);
  $$payload.out.push(`Cancel</a>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></form>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(` <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">`);
  push_element($$payload, "div", 505, 4);
  $$payload.out.push(`<div class="flex items-start">`);
  push_element($$payload, "div", 506, 6);
  $$payload.out.push(`<div class="w-6 h-6 text-blue-600 mr-3 mt-0.5">`);
  push_element($$payload, "div", 507, 8);
  $$payload.out.push(`💡</div>`);
  pop_element();
  $$payload.out.push(` <div>`);
  push_element($$payload, "div", 508, 8);
  $$payload.out.push(`<h3 class="text-sm font-medium text-blue-900 mb-2">`);
  push_element($$payload, "h3", 509, 10);
  $$payload.out.push(`Tips for accurate tracking:</h3>`);
  pop_element();
  $$payload.out.push(` <ul class="text-sm text-blue-800 space-y-1">`);
  push_element($$payload, "ul", 510, 10);
  $$payload.out.push(`<li>`);
  push_element($$payload, "li", 511, 12);
  $$payload.out.push(`• Record values at market close for consistency</li>`);
  pop_element();
  $$payload.out.push(` <li>`);
  push_element($$payload, "li", 512, 12);
  $$payload.out.push(`• Include all investment accounts in your total</li>`);
  pop_element();
  $$payload.out.push(` <li>`);
  push_element($$payload, "li", 513, 12);
  $$payload.out.push(`• Update regularly for better trend analysis</li>`);
  pop_element();
  $$payload.out.push(` <li>`);
  push_element($$payload, "li", 514, 12);
  $$payload.out.push(`• Use the same valuation method each time</li>`);
  pop_element();
  $$payload.out.push(`</ul>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
_page.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  _page as default
};
