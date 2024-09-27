interface ImportMetaEnv {
    readonly VITE_ACCOUNT_ADDRESS: string;
    readonly VITE_VUE_APP_PRIVATE_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  