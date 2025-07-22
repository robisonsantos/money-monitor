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
		client: {start:"_app/immutable/entry/start.CELTWY9A.js",app:"_app/immutable/entry/app.DEJ5CxqG.js",imports:["_app/immutable/entry/start.CELTWY9A.js","_app/immutable/chunks/s6gWR-3E.js","_app/immutable/chunks/ClNsgDs5.js","_app/immutable/chunks/DYNPZ1Yj.js","_app/immutable/entry/app.DEJ5CxqG.js","_app/immutable/chunks/DYNPZ1Yj.js","_app/immutable/chunks/ClNsgDs5.js","_app/immutable/chunks/NZTpNUN0.js","_app/immutable/chunks/cOBINfOn.js","_app/immutable/chunks/Bvs7KfYH.js","_app/immutable/chunks/CkV6gDwx.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js'))
		],
		routes: [
			{
				id: "/api/investments/recent",
				pattern: /^\/api\/investments\/recent\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/investments/recent/_server.ts.js'))
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
