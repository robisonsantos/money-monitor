export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.QyzSntFc.js",app:"_app/immutable/entry/app.Bqd2onnW.js",imports:["_app/immutable/entry/start.QyzSntFc.js","_app/immutable/chunks/FCTtLc2z.js","_app/immutable/chunks/CEGayyFb.js","_app/immutable/entry/app.Bqd2onnW.js","_app/immutable/chunks/CEGayyFb.js","_app/immutable/chunks/DmvMZzVq.js","_app/immutable/chunks/S1evmddw.js","_app/immutable/chunks/B9y8GZOZ.js","_app/immutable/chunks/BUmfinXF.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
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
				id: "/api/portfolios",
				pattern: /^\/api\/portfolios\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/portfolios/_server.ts.js'))
			},
			{
				id: "/api/portfolios/[id]",
				pattern: /^\/api\/portfolios\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/portfolios/_id_/_server.ts.js'))
			},
			{
				id: "/api/portfolios/[id]/investments",
				pattern: /^\/api\/portfolios\/([^/]+?)\/investments\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/portfolios/_id_/investments/_server.ts.js'))
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
