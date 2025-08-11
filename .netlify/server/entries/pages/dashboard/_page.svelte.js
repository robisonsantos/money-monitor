import { D as push, M as push_element, O as pop_element, W as attr_class, U as attr, N as escape_html, G as pop, I as FILENAME, Y as stringify, R as store_get, Z as ensure_array_like, S as unsubscribe_stores } from "../../../chunks/index2.js";
import { a as aggregateInvestments, c as calculateFilteredPortfolioStats } from "../../../chunks/utils.js";
import { F as Folder, C as Circle_alert, p as portfolioIsLoading, s as selectedPortfolio, a as portfolios, b as portfolioError } from "../../../chunks/portfolio.js";
import { C as Chevron_down } from "../../../chunks/chevron-down.js";
DashboardHeader[FILENAME] = "src/lib/components/DashboardHeader.svelte";
function DashboardHeader($$payload, $$props) {
  push(DashboardHeader);
  let {
    portfolios: portfolios2,
    selectedPortfolio: selectedPortfolio2,
    isLoading = false,
    disabled = false
  } = $$props;
  let isDropdownOpen = false;
  $$payload.out.push(`<div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">`);
  push_element($$payload, "div", 125, 0);
  $$payload.out.push(`<div class="flex-shrink-0 relative svelte-d52njm">`);
  push_element($$payload, "div", 127, 2);
  $$payload.out.push(`<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">`);
  push_element($$payload, "div", 128, 4);
  if (isLoading) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="animate-pulse">`);
    push_element($$payload, "div", 131, 8);
    $$payload.out.push(`<div class="h-8 lg:h-10 bg-gray-200 rounded w-64">`);
    push_element($$payload, "div", 132, 10);
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
    if (selectedPortfolio2) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<button${attr_class(`group flex items-center gap-3 px-4 py-3 text-2xl lg:text-3xl font-bold text-gray-900 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 ${stringify(disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}`, void 0, {
        "bg-blue-50": isDropdownOpen,
        "text-blue-700": isDropdownOpen
      })}${attr("disabled", disabled, true)}>`);
      push_element($$payload, "button", 135, 8);
      Folder($$payload, { class: "w-6 h-6 lg:w-7 lg:h-7 text-blue-600 flex-shrink-0" });
      $$payload.out.push(`<!----> <span class="truncate max-w-[250px] sm:max-w-[400px] lg:max-w-[500px]">`);
      push_element($$payload, "span", 145, 10);
      $$payload.out.push(`${escape_html(selectedPortfolio2.name)}</span>`);
      pop_element();
      $$payload.out.push(` `);
      Chevron_down($$payload, {
        class: `w-5 h-5 text-blue-500 transition-transform duration-200 ${stringify("")}`
      });
      $$payload.out.push(`<!----></button>`);
      pop_element();
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<button${attr_class(`flex items-center gap-3 px-4 py-3 text-2xl lg:text-3xl font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 ${stringify(disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}`)}${attr("disabled", disabled, true)}>`);
      push_element($$payload, "button", 151, 8);
      Folder($$payload, { class: "w-6 h-6 lg:w-7 lg:h-7" });
      $$payload.out.push(`<!----> <span>`);
      push_element($$payload, "span", 159, 10);
      $$payload.out.push(`Select Portfolio</span>`);
      pop_element();
      $$payload.out.push(` `);
      Chevron_down($$payload, {
        class: `w-5 h-5 transition-transform duration-200 ${stringify("")}`
      });
      $$payload.out.push(`<!----></button>`);
      pop_element();
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop_element();
  $$payload.out.push(` <p class="text-gray-600 mt-2 ml-0">`);
  push_element($$payload, "p", 166, 4);
  if (selectedPortfolio2) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`Investment Dashboard - Track your portfolio performance over time`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`Investment Dashboard - Select a portfolio to get started`);
  }
  $$payload.out.push(`<!--]--></p>`);
  pop_element();
  $$payload.out.push(` `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  pop_element();
  $$payload.out.push(`</div>`);
  pop_element();
  pop();
}
DashboardHeader.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
_page[FILENAME] = "src/routes/dashboard/+page.svelte";
function _page($$payload, $$props) {
  push(_page);
  var $$store_subs;
  let { data } = $$props;
  let selectedPeriod = "daily";
  let selectedFilter = "7d";
  let investments = [];
  let displayInvestments = investments;
  let aggregatedData = aggregateInvestments(displayInvestments, selectedPeriod, selectedFilter);
  calculateFilteredPortfolioStats(aggregatedData);
  aggregateInvestments(displayInvestments, "daily", selectedFilter);
  $$payload.out.push(`<div class="space-y-6">`);
  push_element($$payload, "div", 177, 0);
  DashboardHeader($$payload, {
    portfolios: store_get($$store_subs ??= {}, "$portfolios", portfolios),
    selectedPortfolio: store_get($$store_subs ??= {}, "$selectedPortfolio", selectedPortfolio),
    isLoading: store_get($$store_subs ??= {}, "$portfolioIsLoading", portfolioIsLoading)
  });
  $$payload.out.push(`<!----> `);
  if (store_get($$store_subs ??= {}, "$portfolioError", portfolioError)) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="card border-red-200 bg-red-50">`);
    push_element($$payload, "div", 191, 4);
    $$payload.out.push(`<div class="flex items-center text-red-700">`);
    push_element($$payload, "div", 192, 6);
    Circle_alert($$payload, { class: "w-5 h-5 mr-2" });
    $$payload.out.push(`<!----> <span>`);
    push_element($$payload, "span", 194, 8);
    $$payload.out.push(`${escape_html(store_get($$store_subs ??= {}, "$portfolioError", portfolioError))}</span>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (displayInvestments.length > 0 && false) ;
  else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  {
    $$payload.out.push("<!--[-->");
    const each_array_2 = ensure_array_like(Array(4));
    const each_array_3 = ensure_array_like(Array(10));
    $$payload.out.push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">`);
    push_element($$payload, "div", 249, 4);
    $$payload.out.push(`<!--[-->`);
    for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
      each_array_2[i];
      $$payload.out.push(`<div class="card">`);
      push_element($$payload, "div", 251, 8);
      $$payload.out.push(`<div class="animate-pulse">`);
      push_element($$payload, "div", 252, 10);
      $$payload.out.push(`<div class="h-4 bg-gray-200 rounded w-3/4 mb-3">`);
      push_element($$payload, "div", 253, 12);
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(` <div class="h-8 bg-gray-200 rounded w-1/2 mb-2">`);
      push_element($$payload, "div", 254, 12);
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(` <div class="h-3 bg-gray-200 rounded w-1/3">`);
      push_element($$payload, "div", 255, 12);
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(`</div>`);
      pop_element();
    }
    $$payload.out.push(`<!--]--></div>`);
    pop_element();
    $$payload.out.push(` <div class="card">`);
    push_element($$payload, "div", 262, 4);
    $$payload.out.push(`<div class="animate-pulse">`);
    push_element($$payload, "div", 263, 6);
    $$payload.out.push(`<div class="h-6 bg-gray-200 rounded w-1/3 mb-4">`);
    push_element($$payload, "div", 264, 8);
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(` <div class="h-96 bg-gray-100 rounded">`);
    push_element($$payload, "div", 265, 8);
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(` <div class="card">`);
    push_element($$payload, "div", 270, 4);
    $$payload.out.push(`<div class="animate-pulse">`);
    push_element($$payload, "div", 271, 6);
    $$payload.out.push(`<div class="h-6 bg-gray-200 rounded w-1/4 mb-4">`);
    push_element($$payload, "div", 272, 8);
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(` <div class="space-y-3">`);
    push_element($$payload, "div", 273, 8);
    $$payload.out.push(`<!--[-->`);
    for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
      each_array_3[i];
      $$payload.out.push(`<div class="flex justify-between items-center py-2">`);
      push_element($$payload, "div", 275, 12);
      $$payload.out.push(`<div class="h-4 bg-gray-200 rounded w-1/6">`);
      push_element($$payload, "div", 276, 14);
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(` <div class="h-4 bg-gray-200 rounded w-1/8">`);
      push_element($$payload, "div", 277, 14);
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(` <div class="h-4 bg-gray-200 rounded w-1/8">`);
      push_element($$payload, "div", 278, 14);
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(` <div class="h-4 bg-gray-200 rounded w-1/8">`);
      push_element($$payload, "div", 279, 14);
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(` <div class="h-4 bg-gray-200 rounded w-1/12">`);
      push_element($$payload, "div", 280, 14);
      $$payload.out.push(`</div>`);
      pop_element();
      $$payload.out.push(`</div>`);
      pop_element();
    }
    $$payload.out.push(`<!--]--></div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
    $$payload.out.push(`</div>`);
    pop_element();
  }
  $$payload.out.push(`<!--]--></div>`);
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
