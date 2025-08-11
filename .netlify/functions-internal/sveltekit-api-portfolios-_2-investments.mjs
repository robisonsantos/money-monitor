import { init } from '../serverless.js';

export const handler = init((() => {
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
			__memo(() => import('../server/nodes/0.js')),
			__memo(() => import('../server/nodes/1.js'))
		],
		routes: [
			{
				id: "/api/portfolios/[id]/investments",
				pattern: /^\/api\/portfolios\/([^/]+?)\/investments\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: null,
				endpoint: __memo(() => import('../server/entries/endpoints/api/portfolios/_id_/investments/_server.ts.js'))
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
