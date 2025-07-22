export const manifest = (() => {
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
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/api/auth/signin",
				pattern: /^\/api\/auth\/signin\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/signin/_server.ts.js'))
			},
			{
				id: "/api/auth/signout",
				pattern: /^\/api\/auth\/signout\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/signout/_server.ts.js'))
			},
			{
				id: "/api/auth/signup",
				pattern: /^\/api\/auth\/signup\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/auth/signup/_server.ts.js'))
			},
			{
				id: "/api/investments",
				pattern: /^\/api\/investments\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/investments/_server.ts.js'))
			},
			{
				id: "/api/investments/export",
				pattern: /^\/api\/investments\/export\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/investments/export/_server.ts.js'))
			},
			{
				id: "/api/investments/import",
				pattern: /^\/api\/investments\/import\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/investments/import/_server.ts.js'))
			},
			{
				id: "/api/investments/recent",
				pattern: /^\/api\/investments\/recent\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/investments/recent/_server.ts.js'))
			},
			{
				id: "/api/investments/[date]",
				pattern: /^\/api\/investments\/([^/]+?)\/?$/,
				params: [{"name":"date","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/investments/_date_/_server.ts.js'))
			},
			{
				id: "/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/dashboard/add",
				pattern: /^\/dashboard\/add\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
