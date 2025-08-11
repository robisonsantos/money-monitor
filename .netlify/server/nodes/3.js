import * as server from '../entries/pages/_page.server.ts.js';

export const index = 3;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/+page.server.ts";
export const imports = ["_app/immutable/nodes/3.DdWUICmH.js","_app/immutable/chunks/DmvMZzVq.js","_app/immutable/chunks/CEGayyFb.js","_app/immutable/chunks/S1evmddw.js","_app/immutable/chunks/B9y8GZOZ.js","_app/immutable/chunks/BWeaT-ZV.js","_app/immutable/chunks/pPaaOSSh.js","_app/immutable/chunks/fyBj51aW.js","_app/immutable/chunks/BOKi8Smt.js","_app/immutable/chunks/FCTtLc2z.js","_app/immutable/chunks/CV1IAjBy.js","_app/immutable/chunks/BUmfinXF.js","_app/immutable/chunks/CcP3WWbO.js","_app/immutable/chunks/BdCzyDbt.js","_app/immutable/chunks/CJSwAvZ5.js"];
export const stylesheets = ["_app/immutable/assets/ThemeToggle.DM_n85EM.css"];
export const fonts = [];
