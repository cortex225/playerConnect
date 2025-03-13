export const config = {
  runtime: "edge",
  unstable_allowDynamic: [
    // Autoriser les modules dynamiques pour next-auth
    "**/node_modules/next-auth/**",
    "**/node_modules/@auth/**",
    "**/node_modules/jose/**",
    "**/node_modules/oauth4webapi/**",
    "**/node_modules/preact-render-to-string/**",
    "**/node_modules/preact/**",
    "**/node_modules/cookie/**",
    "**/node_modules/@panva/**",
  ],
};
