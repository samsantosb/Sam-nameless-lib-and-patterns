/**
 * Compose functions from right to left.
 *
 * A function that takes any number of functions as arguments and composes them from right to left.
 * That is, given functions f, g, and h, and value x, it returns f(g(h(x))).
 * Remember that the functions must have the same input and output types.
 *
 * @param funcs - Functions to compose.
 * @returns A composed function that represents the composition of the input functions.
 *
 * @example
 * // Example of using the compose function with simple mathematical operations
 * const addOne = (x) => x + 1;
 * const double = (x) => x * 2;
 * const subtractThree = (x) => x - 3;
 *
 * // Creating a composed function that subtracts 3 from the input, doubles the result, and then adds 1
 * const processNumber = compose(addOne, double, subtractThree);
 *
 * console.log(processNumber(5)); // Output: ((5 - 3) * 2) + 1 = 5
 *
 * @example
 * // Example of using the compose function for more complex data transformations
 * const wrapInArray = (x) => [x];
 * const appendToArray = (arr) => [...arr, "appended item"];
 * const convertArrayToString = (arr) => arr.join(", ");
 *
 * // Creating a composed function that takes a value, converts an array to a string, appends an item to the array, and then wraps the value in an array
 * const processValue = compose(wrapInArray, appendToArray, convertArrayToString);
 *
 * console.log(processValue("initial item")); // Output: "initial item, appended item"
 */
export const compose =
  <T>(...funcs: ((arg: T) => T)[]): ((arg: T) => T) =>
  (arg: T): T =>
    funcs.reduceRight((acc, func) => func(acc), arg);

/**
 * Pipe functions from left to right.
 *
 * A function that takes any number of functions as arguments and pipes them from left to right.
 * That is, given functions f, g, and h, and value x, it returns h(g(f(x))).
 * Remember that the functions must have the same input and output types.
 *
 * @param funcs - Functions to pipe.
 * @returns A piped function that represents the composition of the input functions.
 *
 * @example
 * // Example of using the pipe function with simple mathematical operations
 * const addOne = (x) => x + 1;
 * const double = (x) => x * 2;
 * const subtractThree = (x) => x - 3;
 *
 * // Creating a piped function that adds 1 to the input, doubles the result, and then subtracts 3
 * const processNumber = pipe(addOne, double, subtractThree);
 *
 * console.log(processNumber(5)); // Output: ((5 + 1) * 2) - 3 = 9
 *
 * @example
 * // Example of using the pipe function for more complex data transformations
 * const wrapInArray = (x) => [x];
 * const appendToArray = (arr) => [...arr, "new item"];
 * const convertArrayToString = (arr) => arr.join(", ");
 *
 * // Creating a piped function that takes a value, wraps it in an array, appends a new item, and then converts the array to a string
 * const processValue = pipe(wrapInArray, appendToArray, convertArrayToString);
 *
 * console.log(processValue("initial item")); // Output: "initial item, new item"
 */
export const pipe =
  <T>(...funcs: ((arg: T) => T)[]): ((arg: T) => T) =>
  (arg: T): T =>
    funcs.reduce((acc, func) => func(acc), arg);

/**
 * Composes asynchronous functions from right to left.
 * Each function should return a Promise that resolves to the type expected by the next function.
 * The final result is wrapped in a Promise.
 *
 * @param funcs - An array of asynchronous functions to compose.
 * @returns A function that, when called with an initial argument, returns a Promise resolving to the result of the composed functions.
 *
 * @example
 * // Example of composing asynchronous functions
 * const double = (x) => Promise.resolve(x * 2);
 * const increment = (x) => Promise.resolve(x + 1);
 * const doubleThenIncrement = composeAsync(increment, double);
 * doubleThenIncrement(3).then(console.log); // Output: 7, since it doubles to 6 then increments to 7
 *
 * @example
 * // Example showing the composability of asynchronous functions handling more complex data
 * const fetchUserData = () => Promise.resolve({ userId: 1, name: 'John' });
 * const extractUserName = (user) => Promise.resolve(user.name);
 * const greetUser = (userName) => Promise.resolve(`Hello, ${userName}!`);
 * const fetchAndGreetUser = composeAsync(greetUser, extractUserName, fetchUserData);
 * fetchAndGreetUser().then(console.log); // Output: "Hello, John!"
 */
export const composeAsync = <T>(
  ...funcs: ((arg: T) => Promise<T>)[]
): ((arg: T) => Promise<T>) => {
  return async (initialArg: T): Promise<T> => {
    const result = { value: initialArg };
    for (const func of funcs.reverse()) {
      result.value = await func(result.value);
    }
    return result.value;
  };
};

/**
 * Pipes asynchronous functions from left to right.
 * Each function should return a Promise that resolves to the type expected by the next function.
 * The final result is wrapped in a Promise.
 *
 * @param funcs - An array of asynchronous functions to pipe.
 * @returns A function that, when called with an initial argument, returns a Promise resolving to the result of the piped functions.
 *
 * @example
 * // Asynchronous function that increments its input
 * const incrementAsync = async (x) => x + 1;
 *
 * // Asynchronous function that doubles its input
 * const doubleAsync = async (x) => x * 2;
 *
 * // Piping the asynchronous functions
 * const incrementThenDouble = pipeAsync(incrementAsync, doubleAsync);
 *
 * // Using the piped function
 * incrementThenDouble(3).then(console.log); // Output: 8
 *
 * @example
 * // Asynchronous function that converts number to string
 * const toStringAsync = async (x) => `Number: ${x}`;
 *
 * // Piping functions: increment, double, then convert to string
 * const processNumber = pipeAsync(incrementAsync, doubleAsync, toStringAsync);
 *
 * // Using the piped function
 * processNumber(3).then(console.log); // Output: "Number: 8"
 */
export const pipeAsync = <T>(
  ...funcs: ((arg: T) => Promise<T>)[]
): ((arg: T) => Promise<T>) => {
  return async (initialArg: T): Promise<T> => {
    let result = initialArg;
    for (const func of funcs) {
      result = await func(result);
    }
    return result;
  };
};

type CustomFunction = (...args: any[]) => any;
/**
 * Transforms a function that expects multiple arguments into a curried function.
 * A curried function is a function that can be called with fewer arguments than
 * it expects, returning a new function that accepts the remaining arguments.
 * This process continues until all arguments are provided, at which point
 * the original function is called and its result returned.
 *
 * @param {Function} fn - The function to curry.
 * @param {...any} args - The arguments to pass to the function.
 * @returns {Function} A curried version of the provided function.
 *
 * @example
 * // Example of a simple function to be curried
 * function add(a, b, c) {
 *   return a + b + c;
 * }
 *
 * // Currying the add function
 * const curriedAdd = curry(add);
 *
 * // Partially applying arguments
 * const addFive = curriedAdd(2, 3);
 *
 * // Calling the partially applied function with the remaining argument
 * console.log(addFive(5)); // Output: 10
 *
 * @example
 * // Using the curried function in a more granular way
 * const addToOne = curriedAdd(1);
 * const addToOneAndTwo = addToOne(2);
 *
 * console.log(addToOneAndTwo(3)); // Output: 6
 */
export function curry(fn: CustomFunction, ...args: any[]): CustomFunction {
  return fn.length <= args.length ? fn(...args) : curry.bind(null, fn, ...args);
}

/**
 * Ensures a function is only called once, regardless of how many times the returned function is called.
 * Subsequent calls to the returned function will have no effect, returning the value from the first call.
 *
 * @param {Function} func - The function to be executed only once.
 * @returns {Function} A function that encapsulates the original function, ensuring it is only executed once.
 *
 * @example
 * const logOnce = once((message) => console.log(message));
 * logOnce("Hello, world!"); // Logs "Hello, world!"
 * logOnce("This will not be logged."); // No effect on subsequent calls
 */
export function once<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  let called = false;
  let result: ReturnType<T>;

  return function (...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true;
      result = func(...args);
    }
    return result;
  };
}

/**
 * Generates the date of the previous month from a provided date.
 *
 * @param {string} date - The reference date in string format (YYYY-MM-DD).
 * @param {number} amount - The number of months to subtract to get the previous month's date.
 * @returns {string} - The date of the previous month in string format (YYYY-MM-DD).
 * @example
 * const oneMonthToPast = 1;
 * const pastMonthDate = getPastMonthDate('2024-03-12', oneMonthToPast);
 * console.log(pastMonthDate); // Output: '2024-02-12'
 */
export const getPastMonthDate = (date: string, amount: number): string => {
  const pastMonthDate = new Date(date);
  pastMonthDate.setMonth(pastMonthDate.getMonth() - amount);
  const pastMonthDateWithoutTime = pastMonthDate.toISOString().split("T")[0];

  return pastMonthDateWithoutTime;
};

/**
 * Generates an array of Date objects, each representing the first day of each month between two specified dates, inclusive.
 * This function assumes that `initialDate` and `finalDate` are valid Date objects and that `initialDate` is earlier than or equal to `finalDate`.
 *
 * @param {Date} initialDate - The start date from which to begin generating the array of dates.
 * @param {Date} finalDate - The end date at which to stop generating the array of dates.
 * @returns {Date[]} An array of Date objects, each representing the first day of a month between the initial and final dates, inclusive.
 * @example
 * const initialDate = new Date('2023-01-15');
 * const finalDate = new Date('2023-03-20');
 * const dateRange = getDateRange(initialDate, finalDate);
 * console.log(dateRange); // Output: [new Date('2023-01-01'), new Date('2023-02-01'), new Date('2023-03-01')]
 */
export const getDateRange = (initialDate: Date, finalDate: Date): Date[] => {
  const oneYearMonths = 12;
  const startYear = initialDate.getFullYear();
  const endYear = finalDate.getFullYear();
  const startMonth = initialDate.getMonth();
  const endMonth = finalDate.getMonth();

  const monthCount =
    (endYear - startYear) * oneYearMonths + (endMonth - startMonth) + 1;

  const dates = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(startYear, startMonth + index, 1);
    return date;
  });

  return dates;
};
