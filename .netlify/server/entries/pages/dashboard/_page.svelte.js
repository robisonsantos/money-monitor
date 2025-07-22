import { a0 as ensure_array_like, Q as pop, O as push } from "../../../chunks/index2.js";
import { a as aggregateInvestments, c as calculateFilteredPortfolioStats } from "../../../chunks/utils.js";
function _page($$payload, $$props) {
  push();
  let { data } = $$props;
  let selectedPeriod = "daily";
  let selectedFilter = "7d";
  let investments = [];
  let displayInvestments = investments;
  let aggregatedData = aggregateInvestments(displayInvestments, selectedPeriod, selectedFilter);
  calculateFilteredPortfolioStats(aggregatedData);
  aggregateInvestments(displayInvestments, "daily", selectedFilter);
  $$payload.out.push(`<div class="space-y-6"><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6"><div class="flex-shrink-0"><h1 class="text-2xl lg:text-3xl font-bold text-gray-900">Investment Dashboard</h1> <p class="text-gray-600 mt-1">Track your portfolio performance over time</p></div> `);
  if (displayInvestments.length > 0 && false) ;
  else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> `);
  {
    $$payload.out.push("<!--[-->");
    const each_array_2 = ensure_array_like(Array(4));
    const each_array_3 = ensure_array_like(Array(10));
    $$payload.out.push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"><!--[-->`);
    for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
      each_array_2[i];
      $$payload.out.push(`<div class="card"><div class="animate-pulse"><div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div> <div class="h-8 bg-gray-200 rounded w-1/2 mb-2"></div> <div class="h-3 bg-gray-200 rounded w-1/3"></div></div></div>`);
    }
    $$payload.out.push(`<!--]--></div> <div class="card"><div class="animate-pulse"><div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div> <div class="h-96 bg-gray-100 rounded"></div></div></div> <div class="card"><div class="animate-pulse"><div class="h-6 bg-gray-200 rounded w-1/4 mb-4"></div> <div class="space-y-3"><!--[-->`);
    for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
      each_array_3[i];
      $$payload.out.push(`<div class="flex justify-between items-center py-2"><div class="h-4 bg-gray-200 rounded w-1/6"></div> <div class="h-4 bg-gray-200 rounded w-1/8"></div> <div class="h-4 bg-gray-200 rounded w-1/8"></div> <div class="h-4 bg-gray-200 rounded w-1/8"></div> <div class="h-4 bg-gray-200 rounded w-1/12"></div></div>`);
    }
    $$payload.out.push(`<!--]--></div></div></div>`);
  }
  $$payload.out.push(`<!--]--></div>`);
  pop();
}
export {
  _page as default
};
