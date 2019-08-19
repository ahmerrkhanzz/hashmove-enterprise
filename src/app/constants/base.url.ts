import { environment } from "../../environments/environment";
// declare var MAIN_API_BASE_URL: string;
// declare var MAIN_API_BASE_EXTERNAL_URL: string;

export var baseApi: string = '';
export var baseExternalAssets: string = '';

export function setBaseApi(_baseApi: string) {
  baseApi = _baseApi
}

export function setBaseExternal(_baseExternalAssets: string) {
  baseExternalAssets = _baseExternalAssets
}

// if (environment.staging) {
//   //Stagging Live URL
//   baseApi = "http://hashmove.texpo.com:81/api/";
//   baseExternalAssets = "http://hashmove.texpo.com:81";
// } else if (environment.alphaLive) {
//   // Alpha Live Release
//   baseApi = "http://alpha.hashmove.com:81/api/";
//   baseExternalAssets = "http://alpha.hashmove.com:81";
// } else if (environment.alphaDev) {
//   // Alpha Dev Release
//   baseApi = "http://10.20.1.13:9093/api/";
//   baseExternalAssets = "http://10.20.1.13:9093";
// } else if (environment.alphaQA) {
//   // Alpha QA Release
//   baseApi = "http://10.20.1.13:8093/api/";
//   baseExternalAssets = "http://10.20.1.13:8093";
// } else if (environment.dev) {
//   // Beta Dev Release
//   baseApi = "http://10.20.1.13:9091/api/";
//   baseExternalAssets = "http://10.20.1.13:9091";
//   // baseApi = "https://betademoapi.hashmove.com/api/";
//   // baseExternalAssets = "https://betademoapi.hashmove.com";

//   // baseApi = "https://betademoapi.hashmove.com/api/";
//   // baseExternalAssets = "https://betademoapi.hashmove.com";

//   // baseApi = "http://10.20.1.60/api/";
//   // baseExternalAssets = "http://10.20.1.60";

//   // baseApi = "https://hmtex4.azurewebsites.net/api/";
//   // baseExternalAssets = "https://hmtex4.azurewebsites.net";
// } else if (environment.qa) {
//   // Beta QA Release
//   baseApi = "http://10.20.1.13:8091/api/";
//   baseExternalAssets = "http://10.20.1.13:8091";

//   // baseApi = "http://10.20.1.13:7091/api/";
//   // baseExternalAssets = "http://10.20.1.13:7091";
// } else if (environment.betaLive) {
//   // Beta QA Release
//   // baseApi = "https://betaapi.hashmove.com/api/";
//   // baseExternalAssets = "https://betaapi.hashmove.com";

//   baseApi = "https://betademoapi.hashmove.com/api/";
//   baseExternalAssets = "https://betademoapi.hashmove.com";
// } else {
//   // Local URL
//   baseApi = "http://10.20.1.13:96/api/";
//   baseExternalAssets = "http://10.20.1.13:96";
// }
