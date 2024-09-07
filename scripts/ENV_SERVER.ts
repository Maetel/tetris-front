
/* DO NOT EDIT! THIS IS AUTO-GENERATED FILE */
import ENV_PUBLIC from "./ENV_PUBLIC"
export default class ENV_SERVER extends ENV_PUBLIC {
  
  ////////////////////////////////////////////////////////////////////////
  // Common Area
  
  ////////////////////////////////////////////////////////////////////////
  // Forked Area
  static SERVER_URL =
    (process.env.SERVER_URL_OVERRIDE ?? (
      (ENV_PUBLIC.IS_DEV ) ? process.env.SERVER_URL_DEV :
      (ENV_PUBLIC.IS_QA  ) ? process.env.SERVER_URL_QA :
      (ENV_PUBLIC.IS_PROD) ? process.env.SERVER_URL_PROD :
      null
    )) as string;

  ////////////////////////////////////////////////////////////////////////
  // Init Area
  static is_ENV_SERVER_init = false;
  static init_ENV_SERVER = () => {
    ENV_SERVER.init_ENV_PUBLIC();
    
      if (ENV_SERVER.is_ENV_SERVER_init) {
        return;
      }
      if (!(ENV_SERVER.IS_DEV || ENV_SERVER.IS_PROD || ENV_SERVER.IS_QA)) {
        throw new Error("Invalid NODE_ENV: " + ENV_SERVER.DST_ENV);
      }
    
      const variables = {
        IS_DEV: ENV_SERVER.IS_DEV,
        IS_PROD: ENV_SERVER.IS_PROD,
        IS_QA: ENV_SERVER.IS_QA,
        IS_DEV_OR_QA: ENV_SERVER.IS_DEV_OR_QA,
        SERVER_URL : ENV_SERVER.SERVER_URL
      };
      const isNullish = (val: string) =>
        val === undefined ||
        val === null ||
        val?.length === 0;
    
      const missing = Object.keys(variables).filter((key) => isNullish(variables[key])).filter((key) => !key.toLowerCase().startsWith("nullable_"));
    
      if (missing.length > 0) {
        throw new Error(".env.local에 환경변수를 추가해주세요 : " + missing.join(", "));
      }
      ENV_SERVER.is_ENV_SERVER_init = true;
  
  }
}
ENV_SERVER.init_ENV_SERVER();
