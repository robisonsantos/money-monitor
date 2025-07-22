import { init } from '../serverless.js';

export const handler = init((() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["_redirects","favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.anMlWfe0.js",app:"_app/immutable/entry/app.Blo1rSNR.js",imports:["_app/immutable/entry/start.anMlWfe0.js","_app/immutable/chunks/DEEpOjUG.js","_app/immutable/chunks/CkVrU0_d.js","_app/immutable/chunks/BAfSlBBc.js","_app/immutable/entry/app.Blo1rSNR.js","_app/immutable/chunks/BAfSlBBc.js","_app/immutable/chunks/CkVrU0_d.js","_app/immutable/chunks/CWj6FrbW.js","_app/immutable/chunks/BLuVNXdm.js","_app/immutable/chunks/DVrLZmvX.js","_app/immutable/chunks/C7a5Nu68.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js'))
		],
		routes: [
			{
				id: "/api/investments/export",
				pattern: /^\/api\/investments\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/investments/export/_server.ts.js'))
			},
			{
				id: "/api/investments/[date]",
				pattern: /^\/api\/investments\/([^/]+?)\/?$/,
				params: [{"name":"date","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/investments/_date_/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})());
