import { K as getContext, D as push, M as push_element, N as escape_html, O as pop_element, G as pop, I as FILENAME } from "../../chunks/index2.js";
import "clsx";
import { s as stores } from "../../chunks/client.js";
({
  check: stores.updated.check
});
function context() {
  return getContext("__request__");
}
const page$1 = {
  get error() {
    return context().page.error;
  },
  get status() {
    return context().page.status;
  }
};
const page = page$1;
Error$1[FILENAME] = "node_modules/@sveltejs/kit/src/runtime/components/svelte-5/error.svelte";
function Error$1($$payload, $$props) {
  push(Error$1);
  $$payload.out.push(`<h1>`);
  push_element($$payload, "h1", 5, 0);
  $$payload.out.push(`${escape_html(page.status)}</h1>`);
  pop_element();
  $$payload.out.push(` <p>`);
  push_element($$payload, "p", 6, 0);
  $$payload.out.push(`${escape_html(page.error?.message)}</p>`);
  pop_element();
  pop();
}
Error$1.render = function() {
  throw new Error$1("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  Error$1 as default
};
