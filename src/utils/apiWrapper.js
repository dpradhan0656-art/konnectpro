import Logger from './logger';

function withTimeout(taskPromise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    taskPromise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Standardized API guard:
 * - Timeout
 * - Simple retry (default: 2 retries)
 * Task should be a function returning a promise.
 */
export async function runWithRetryTimeout(task, options = {}) {
  const retries = Number.isInteger(options.retries) ? options.retries : 2;
  const timeoutMs = Number.isInteger(options.timeoutMs) ? options.timeoutMs : 8000;
  const scope = options.scope || 'API';

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await withTimeout(Promise.resolve().then(() => task()), timeoutMs);
    } catch (error) {
      lastError = error;
      Logger.warn(scope, `Attempt ${attempt + 1} failed`, { timeoutMs, retries, error: String(error?.message || error) });
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export default runWithRetryTimeout;
