import * as server from '../entries/pages/dashboard/_layout.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dashboard/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/dashboard/+layout.server.ts";
export const imports = ["_app/immutable/nodes/2.BIhpLBaL.js","_app/immutable/chunks/DmvMZzVq.js","_app/immutable/chunks/CEGayyFb.js","_app/immutable/chunks/S1evmddw.js","_app/immutable/chunks/B9y8GZOZ.js","_app/immutable/chunks/5c2B9r4u.js","_app/immutable/chunks/pPaaOSSh.js","_app/immutable/chunks/fyBj51aW.js","_app/immutable/chunks/BWeaT-ZV.js","_app/immutable/chunks/FCTtLc2z.js","_app/immutable/chunks/CV2_hpCg.js","_app/immutable/chunks/CV1IAjBy.js","_app/immutable/chunks/BUmfinXF.js","_app/immutable/chunks/CcP3WWbO.js","_app/immutable/chunks/BdCzyDbt.js"];
export const stylesheets = ["_app/immutable/assets/ThemeToggle.DM_n85EM.css"];
export const fonts = [];
