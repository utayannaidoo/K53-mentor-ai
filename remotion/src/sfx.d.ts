/**
 * The bundler emits an asset URL for audio imports, so the sound design can
 * live in `src/sfx/` next to the code that plays it. Keeping it out of the
 * `publicDir` matters here: that is the Next app's `public/` folder, and the
 * web app should not be shipping the film's sound effects to browsers.
 */
declare module "*.wav" {
  const src: string;
  export default src;
}
