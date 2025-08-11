import { D as push, J as slot, G as pop, I as FILENAME } from "../../chunks/index2.js";
import "../../chunks/theme.js";
_layout[FILENAME] = "src/routes/+layout.svelte";
function _layout($$payload, $$props) {
  push(_layout);
  $$payload.out.push(`<!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!---->`);
  pop();
}
_layout.render = function() {
  throw new Error("Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information");
};
export {
  _layout as default
};
