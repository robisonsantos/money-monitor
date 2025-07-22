import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.DXI_4D77.js","_app/immutable/chunks/NZTpNUN0.js","_app/immutable/chunks/DYNPZ1Yj.js","_app/immutable/chunks/ClNsgDs5.js","_app/immutable/chunks/cOBINfOn.js","_app/immutable/chunks/C80QMRyu.js","_app/immutable/chunks/BMq-sHxJ.js","_app/immutable/chunks/C0vvwicr.js","_app/immutable/chunks/p49l-z9x.js","_app/immutable/chunks/CkV6gDwx.js","_app/immutable/chunks/Bvs7KfYH.js","_app/immutable/chunks/BeV04U8c.js","_app/immutable/chunks/ClIaix5w.js","_app/immutable/chunks/risHFb8W.js"];
export const stylesheets = [];
export const fonts = [];
