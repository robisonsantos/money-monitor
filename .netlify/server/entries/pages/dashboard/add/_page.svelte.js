import { Y as sanitize_props, Z as spread_props, T as slot, _ as head, W as escape_html, $ as attr, a1 as attr_class, Q as pop, O as push, a2 as stringify } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/state.svelte.js";
import { format } from "date-fns";
import { P as Plus } from "../../../../chunks/plus.js";
import { I as Icon } from "../../../../chunks/Icon.js";
function Save($$payload, $$props) {
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
  let date = format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
  let value = "";
  let isLoading = false;
  let isEditMode = false;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>${escape_html("Add Entry")} - Money Monitor</title>`;
  });
  $$payload.out.push(`<div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 -mx-4 -my-6 px-4 py-8 sm:px-6 sm:py-12"><div class="max-w-2xl mx-auto"><div class="text-center mb-10"><div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">`);
  {
    $$payload.out.push("<!--[!-->");
    Plus($$payload, { class: "w-8 h-8 text-blue-600" });
  }
  $$payload.out.push(`<!--]--></div> <h1 class="text-4xl font-bold text-gray-900 mb-3">${escape_html("Add Investment Entry")}</h1> <p class="text-lg text-gray-600 max-w-md mx-auto">${escape_html("Record your portfolio value for a specific date")}</p></div> <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8"><div class="p-8 sm:p-10">`);
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
  $$payload.out.push(`<!--]--> <form class="space-y-8"><div><label for="date" class="block text-sm font-semibold text-gray-800 mb-3">Date</label> <input id="date" type="date"${attr("value", date)}${attr_class(`w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${stringify("bg-white")}`)} required${attr("disabled", isEditMode, true)}${attr("readonly", isEditMode, true)}/> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <p class="text-sm text-gray-500 mt-3">${escape_html("Select the date for this investment value")}</p></div> <div><label for="value" class="block text-sm font-semibold text-gray-800 mb-3">Portfolio Value ($)</label> <div class="relative"><div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><span class="text-gray-500 text-lg font-medium">$</span></div> <input id="value" type="number" step="0.01" min="0"${attr("value", value)} class="w-full pl-8 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"${attr("placeholder", "0.00")} required${attr("disabled", isLoading, true)}/></div> <p class="text-sm text-gray-500 mt-3">Enter the total value of your investment portfolio</p></div> <div class="flex flex-col sm:flex-row items-center gap-4 pt-6"><button type="submit" class="w-full sm:w-auto btn-primary flex items-center justify-center space-x-3 px-8 py-4 text-lg font-semibold rounded-xl"${attr("disabled", false, true)}>`);
  {
    $$payload.out.push("<!--[!-->");
    {
      $$payload.out.push("<!--[!-->");
      Save($$payload, { class: "w-5 h-5" });
      $$payload.out.push(`<!----> <span>Save Entry</span>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></button> <a href="/dashboard" class="w-full sm:w-auto btn-secondary px-8 py-4 text-lg font-semibold rounded-xl text-center">Cancel</a></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></form></div></div> <div class="bg-blue-50 border border-blue-200 rounded-xl p-6"><div class="flex items-start"><div class="w-6 h-6 text-blue-600 mr-3 mt-0.5">💡</div> <div><h3 class="text-sm font-medium text-blue-900 mb-2">Tips for accurate tracking:</h3> <ul class="text-sm text-blue-800 space-y-1"><li>• Record values at market close for consistency</li> <li>• Include all investment accounts in your total</li> <li>• Update regularly for better trend analysis</li> <li>• Use the same valuation method each time</li></ul></div></div></div></div></div>`);
  pop();
}
export {
  _page as default
};
