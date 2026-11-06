/** Per-IP caps for public routes. Pass as the route's options: app.post(path, limit(5), handler). */
export const limit = (max: number, timeWindow = "10 minutes") => ({
  config: { rateLimit: { max, timeWindow } },
});
