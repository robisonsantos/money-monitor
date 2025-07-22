import * as server from '../entries/pages/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.CIcfJVKI.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/BAfSlBBc.js","_app/immutable/chunks/CkVrU0_d.js","_app/immutable/chunks/BLuVNXdm.js","_app/immutable/chunks/CZvUju-3.js","_app/immutable/chunks/CJFBrZpV.js","_app/immutable/chunks/B2jYjAtN.js","_app/immutable/chunks/BNXpeyE5.js","_app/immutable/chunks/C7a5Nu68.js","_app/immutable/chunks/Vd0o_GmC.js","_app/immutable/chunks/CiOBCqQ_.js","_app/immutable/chunks/C0CScgT0.js","_app/immutable/chunks/BsGGmnJu.js"];
export const stylesheets = [];
export const fonts = [];
