import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.C4t8Fitx.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/BAfSlBBc.js","_app/immutable/chunks/CkVrU0_d.js","_app/immutable/chunks/BLuVNXdm.js","_app/immutable/chunks/CZvUju-3.js","_app/immutable/chunks/CJFBrZpV.js","_app/immutable/chunks/B2jYjAtN.js","_app/immutable/chunks/BNXpeyE5.js","_app/immutable/chunks/C7a5Nu68.js","_app/immutable/chunks/DVrLZmvX.js","_app/immutable/chunks/D6P1aTOf.js","_app/immutable/chunks/C0CScgT0.js","_app/immutable/chunks/BsGGmnJu.js"];
export const stylesheets = [];
export const fonts = [];
