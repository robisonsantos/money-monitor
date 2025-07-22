import * as server from '../entries/pages/dashboard/_layout.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+layout.server.ts";
export const imports = ["_app/immutable/nodes/2.CAehiHtu.js","_app/immutable/chunks/NZTpNUN0.js","_app/immutable/chunks/DYNPZ1Yj.js","_app/immutable/chunks/ClNsgDs5.js","_app/immutable/chunks/s6gWR-3E.js","_app/immutable/chunks/ClIaix5w.js","_app/immutable/chunks/BMq-sHxJ.js","_app/immutable/chunks/C0vvwicr.js","_app/immutable/chunks/CkV6gDwx.js","_app/immutable/chunks/C80QMRyu.js","_app/immutable/chunks/p49l-z9x.js","_app/immutable/chunks/Cm454yfC.js"];
export const stylesheets = [];
export const fonts = [];
