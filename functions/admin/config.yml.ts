// Fallback: serve config.yml in case Astro's static output blocks the public/ file
export const onRequest = async (context) => {
  // Let the static file serve if possible
  return context.next();
};
