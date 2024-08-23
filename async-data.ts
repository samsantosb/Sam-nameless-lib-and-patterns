/**
 * Asynchronous sleep function.
 *
 * Pauses the execution for a specified amount of time. This can be useful for delaying operations in asynchronous workflows.
 *
 * @param {number} minutes - The time to sleep in minutes.
 * @returns {Promise<void>} A promise resolving after the specified time.
 *
 * @example
 * // Example of using sleep to delay an operation
 * async function delayedGreeting() {
 *   console.log('Preparing greeting...');
 *   await sleep(0.1); // Sleeps for 6 seconds (0.1 minutes)
 *   console.log('Hello, World!');
 * }
 *
 * delayedGreeting();
 * // Output:
 * // Preparing greeting...
 * // (waits 6 seconds)
 * // Hello, World!
 */
export async function sleep(minutes: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, minutes * 60000));
}

/**
 * Executes promises in batches with a specified chunk size. If chunk size is 0, behaves like Promise.allSettled,
 * returning an object containing arrays of resolved and rejected promises.
 *
 * Useful for managing large sets of asynchronous operations where you want to limit the number of concurrent operations.
 *
 * @param {Array<Promise<unknown>>} promises - The array of promises to be executed.
 * @param {number} chunkSize - The size of each batch. If 0, all promises are executed at once.
 * @returns {Promise<{resolved: unknown[], rejected: unknown[]}>} A promise that resolves with an object
 * containing arrays of resolved and rejected promises.
 *
 * @example
 * // Example of executing a batch of promises with a chunk size
 * const promiseGenerator = (time, willResolve) => new Promise((resolve, reject) =>
 *   setTimeout(() => willResolve ? resolve(`Resolved after ${time}ms`) : reject(new Error(`Rejected after ${time}ms`)), time)
 * );
 *
 * const promises = [
 *   promiseGenerator(1000, true),
 *   promiseGenerator(2000, false),
 *   promiseGenerator(1500, true),
 *   promiseGenerator(3000, false),
 * ];
 *
 * batchPromiseAllSettled(promises, 2).then(console.log);
 * // Output: {
 * //   resolved: ["Resolved after 1000ms", "Resolved after 1500ms"],
 * //   rejected: [Error: "Rejected after 2000ms", Error: "Rejected after 3000ms"]
 * // }
 *
 * @example
 * // Example of executing all promises at once using a chunk size of 0
 * batchPromiseAllSettled(promises, 0).then(console.log);
 * // Output: {
 * //   resolved: ["Resolved after 1000ms", "Resolved after 1500ms"],
 * //   rejected: [Error: "Rejected after 2000ms", Error: "Rejected after 3000ms"]
 * // }
 */
export async function batchPromiseAllSettled(
  promises: Array<Promise<unknown>>,
  chunkSize: number
): Promise<{ resolved: unknown[]; rejected: unknown[] }> {
  const finalResults: { resolved: unknown[]; rejected: unknown[] } = {
    resolved: [],
    rejected: [],
  };

  if (chunkSize === 0) {
    const allResults = await Promise.allSettled(promises);
    for (const result of allResults) {
      if (result.status === "fulfilled") {
        finalResults.resolved.push(result.value);
        continue;
      }
      finalResults.rejected.push(result.reason);
    }
    return finalResults;
  }

  for (let index = 0; index < promises.length; index += chunkSize) {
    const chunk = promises.slice(index, index + chunkSize);
    const chunkResults = await Promise.allSettled(chunk);
    for (const result of chunkResults) {
      if (result.status === "fulfilled") {
        finalResults.resolved.push(result.value);
        continue;
      }
      finalResults.rejected.push(result.reason);
    }
  }

  return finalResults;
}

/**
 * Creates a memoized version of a given asynchronous function with an optional Time-To-Live (TTL) for the cache entries.
 * The returned memoized function also includes methods for clearing the entire cache or deleting specific cache entries.
 *
 * @template T - The types of the arguments for the function.
 * @template R - The return type of the function, which can be a promise or a direct value.
 * @param {(...args: T[]) => Promise<R> | R} func - The asynchronous function to memoize.
 * @param {keyof typeof CACHE_TIME_OPTIONS} [ttl] - The Time-To-Live (TTL) for cache entries, in minutes.
 * @returns {Function & {clearCache: Function, deleteCache: Function}} A memoized version of the provided function with additional `clearCache` and `deleteCache` methods. The memoized function returns a promise resolving to the cached value or the new value if the cache is expired or not set.
 *
 * @example
 * // Example of memoizing an async function that fetches data with a TTL.
 * async function fetchData(url) {
 *   const response = await fetch(url);
 *   return response.json();
 * }
 *
 * // Create a memoized version of fetchData with a TTL of 5 minutes.
 * const memoizedFetchData = asyncCache(fetchData, 5);
 *
 * // Use the memoized function to fetch data. Subsequent calls with the same arguments
 * // within 5 minutes will return the cached result.
 * memoizedFetchData('https://api.example.com/data').then(console.log);
 *
 * // Example of deleting a specific cache entry.
 * memoizedFetchData.deleteCache('https://api.example.com/data');
 *
 * // Example of clearing the entire cache.
 * memoizedFetchData.clearCache();
 */
export function asyncCache<T extends any[], R>(
  func: (...args: T) => Promise<R> | R,
  ttl?: number
): ((...args: T) => Promise<R>) & {
  clearCache: () => void;
  deleteCache: (...args: T) => void;
} {
  const cache = new Map<string, { timestamp: number; value: Promise<R> | R }>();
  const millisecondsPerMinute = 60 * 1000;

  const isEntryExpired = (timestamp: number): boolean => {
    if (ttl === undefined) {
      return false;
    }
    const timeDifference = Date.now() - timestamp;
    const ttlMilliseconds = ttl * millisecondsPerMinute;
    return timeDifference > ttlMilliseconds;
  };

  const memoizedFunc = async (...args: T): Promise<R> => {
    const key = args.length === 0 ? "genericKey" : JSON.stringify(args);
    const entry = cache.get(key);

    if (entry && !isEntryExpired(entry.timestamp)) {
      return entry.value as R;
    }

    const result = await func(...args);
    cache.set(key, { timestamp: Date.now(), value: result });
    return result;
  };

  const deleteCache = (...args: T) => {
    const cacheKey = args.length === 0 ? "genericKey" : JSON.stringify(args);
    cache.delete(cacheKey);
  };

  const clearCache = () => {
    cache.clear();
  };

  return Object.assign(memoizedFunc, { clearCache, deleteCache });
}
