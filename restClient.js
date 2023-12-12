import { RestClientV5 } from 'bybit-api'
import 'dotenv/config'
// import CryptoJS from 'crypto-js'
// InverseClient,
//   LinearClient,
//   InverseFuturesClient,
//   SpotClientV3,
//   UnifiedMarginClient,
//   USDCOptionClient,
//   USDCPerpetualClient,
//   AccountAssetClient,
//   CopyTradingClient,
//   RestClientV5

// const restClientOptions = {
//   /** Your API key. Optional, if you plan on making private api calls */
//   key?: string;

//   /** Your API secret. Optional, if you plan on making private api calls */
//   secret?: string;

//   /** Set to `true` to connect to testnet. Uses the live environment by default. */
//   testnet?: boolean;

//   /** Override the max size of the request window (in ms) */
//   recv_window?: number;

//   /** Disabled by default. This can help on machines with consistent latency problems. */
//   enable_time_sync?: boolean;

//   /** How often to sync time drift with bybit servers */
//   sync_interval_ms?: number | string;

//   /** Default: false. If true, we'll throw errors if any params are undefined */
//   strict_param_validation?: boolean;

//   /**
//    * Optionally override API protocol + domain
//    * e.g baseUrl: 'https://api.bytick.com'
//    **/
//   baseUrl?: string;

//   /** Default: true. whether to try and post-process request exceptions. */
//   parse_exceptions?: boolean;

//   /** Default: false. Enable to parse/include per-API/endpoint rate limits in responses. */
//   parseAPIRateLimits?: boolean;

//   /** Default: false. Enable to throw error if rate limit parser fails */
//   throwOnFailedRateLimitParse?: boolean;
// };

const restClient = new RestClientV5({
	testnet: false,
	key: process.env.API_KEY,
	secret: process.env.API_SECRET_KEY,
	enable_time_sync: true,
	recv_window: 5000,
	baseUrl: 'https://api.bybit.com/',
})

export default restClient
