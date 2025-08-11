import * as server from '../entries/pages/dashboard/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.BepvraLu.js","_app/immutable/chunks/DmvMZzVq.js","_app/immutable/chunks/CEGayyFb.js","_app/immutable/chunks/S1evmddw.js","_app/immutable/chunks/B9y8GZOZ.js","_app/immutable/chunks/BWeaT-ZV.js","_app/immutable/chunks/pPaaOSSh.js","_app/immutable/chunks/fyBj51aW.js","_app/immutable/chunks/5c2B9r4u.js","_app/immutable/chunks/1Tx_2Ce-.js","_app/immutable/chunks/BUmfinXF.js","_app/immutable/chunks/BdCzyDbt.js","_app/immutable/chunks/BOKi8Smt.js","_app/immutable/chunks/CJSwAvZ5.js"];
export const stylesheets = ["_app/immutable/assets/4.CYLTqMex.css"];
export const fonts = [];
