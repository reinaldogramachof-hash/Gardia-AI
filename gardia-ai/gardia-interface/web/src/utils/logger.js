export const logger = {
  info: (msg, data = '') => console.info(`[Gardia][INFO] ${msg}`, data),
  warn: (msg, data = '') => console.warn(`[Gardia][WARN] ${msg}`, data),
  error: (msg, data = '') => console.error(`[Gardia][ERROR] ${msg}`, data),
  debug: (msg, data = '') => {
    if (import.meta.env.DEV) {
      console.debug(`[Gardia][DEBUG] ${msg}`, data);
    }
  }
};
