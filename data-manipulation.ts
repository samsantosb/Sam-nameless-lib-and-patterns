import { deepStrictEqual } from "assert";

/**
 * Creates a deep clone of an object using structured cloning.
 *
 * This function uses the `structuredClone` method to create a deep clone of the input object.
 * It ensures that the cloned object is a completely separate instance, with no references to the original object's properties or nested objects.
 *
 * @param {T} obj - The object to clone.
 * @returns {T} A deep clone of the input object.
 * @template T - The type of the input object.
 *
 * @example
 * // Example of cloning a simple object
 * const originalObject = { name: 'John', age: 30 };
 * const clonedObject = deepClone(originalObject);
 * console.log(clonedObject); // Output: { name: 'John', age: 30 }
 * console.log(originalObject === clonedObject); // Output: false
 *
 * @example
 * // Example of cloning an array of objects
 * const originalArray = [{ name: 'John' }, { name: 'Jane' }];
 * const clonedArray = deepClone(originalArray);
 * console.log(clonedArray); // Output: [{ name: 'John' }, { name: 'Jane' }]
 * console.log(originalArray === clonedArray); // Output: false
 *
 * @example
 * // Example of cloning a nested object
 * const originalNestedObject = { person: { name: 'John', address: { city: 'New York', zip: '10001' } } };
 * const clonedNestedObject = deepClone(originalNestedObject);
 * console.log(clonedNestedObject); // Output: { person: { name: 'John', address: { city: 'New York', zip: '10001' } } }
 * console.log(originalNestedObject === clonedNestedObject); // Output: false
 * console.log(originalNestedObject.person === clonedNestedObject.person); // Output: false
 */
function deepClone<T>(obj: T, options: StructuredSerializeOptions): T {
  return structuredClone(obj, options);
}

/**
 * Compares two values of the same type to determine if they are deeply equal.
 *
 * This function utilizes `deepStrictEqual` for comparison, which can throw an error if the values are not equal.
 * If an error is thrown, the catch block catches it, and the function returns false, indicating the values are not deeply equal.
 * If no error is thrown, the values are considered deeply equal, and the function returns true.
 *
 * @param {T} a - The first value to compare.
 * @param {T} b - The second value to compare.
 * @returns {boolean} True if the values are deeply equal, false otherwise.
 * @template T - The type of the values to be compared.
 *
 * @example
 * // Example of comparing simple values
 * console.log(deepEqual<number>(1, 1)); // Output: true
 * console.log(deepEqual<number | string>(1, '1')); // Output: false
 *
 * @example
 * // Example of comparing arrays
 * const array1 = [1, 2, 3];
 * const array2 = [1, 2, 3];
 * console.log(deepEqual<number[]>(array1, array2)); // Output: true
 *
 * @example
 * // Example of comparing objects
 * const object1 = { name: 'John', age: 30 };
 * const object2 = { name: 'John', age: 30 };
 * console.log(deepEqual<{ name: string; age: number }>(object1, object2)); // Output: true
 *
 * @example
 * // Example of comparing nested objects
 * const nestedObject1 = { person: { name: 'John', age: 30 }};
 * const nestedObject2 = { person: { name: 'John', age: 30 }};
 * console.log(deepEqual<{ person: { name: string; age: number } }>(nestedObject1, nestedObject2)); // Output: true
 */
function deepEqual(a: unknown, b: unknown): boolean {
  try {
    // Assuming deepStrictEqual is defined or imported from an assertion library
    deepStrictEqual(a, b);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recursively applies Object.freeze to an object and all its nested objects.
 * This function makes the entire object structure immutable, meaning that no properties
 * can be added, changed, or removed once the object is frozen.
 *
 * @param {object} object - The object to be deeply frozen.
 * @returns {object} The same object after being deeply frozen.
 *
 * @example
 * const user = deepFreeze({
 *   name: "John",
 *   details: {
 *     age: 30,
 *     address: {
 *       city: "New York"
 *     }
 *   }
 * });
 *
 * user.details.age = 31; // This will not work as the object is deeply frozen.
 * console.log(user.details.age); // 30
 */
function deepFreeze<T extends Record<string, any>>(object: T): T {
  // Freeze the initial object
  Object.freeze(object);

  // Recursively freeze all deep properties
  Object.getOwnPropertyNames(object).forEach((prop) => {
    const property = object[prop];
    if (
      object.hasOwnProperty(prop) &&
      property !== null &&
      (typeof property === "object" || typeof property === "function") &&
      !Object.isFrozen(property)
    ) {
      deepFreeze(property);
    }
  });

  return object;
}

/**
 * Creates a dictionary (map) from an array of objects, using a specified property value as the key.
 * Intended for use with unique identifier properties, such as 'id', as the key.
 * @param dataArray - Array of objects to be transformed into a map.
 * @param key - The property of the objects in the array that will be used as the key in the resulting map.
 * @returns A map with keys based on the values of the specified `key` property of each object in `dataArray`.
 * @template T - The type of object within the `dataArray`.
 * @template K extends keyof T - The type of the key property within T, ensuring it exists on T.
 * @example
 * const users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
 * const userMap = createMapDictionary(users, 'id');
 * console.log(userMap.get(1)); // Outputs: { id: 1, name: 'Alice' }
 */
export function createMapDictionary<
  const T extends Record<PropertyKey, any>,
  K extends keyof T
>(dataArray: ReadonlyArray<T>, key: K): Map<T[K], T> {
  return dataArray.reduce<Map<T[K], T>>((acc, item) => {
    acc.set(item[key], item);
    return acc;
  }, new Map<T[K], T>());
}

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

/**
 * Initiates a left join operation between two arrays of objects based on separate keys in each array.
 * This approach allows for greater flexibility by permitting the joining keys in the source and target arrays to differ.
 *
 * @template T Type of objects in the source array.
 * @template U Type of objects in the target array.
 * @param {T[]} source The source array for the join operation.
 * @returns An object with the `in` method, which is used to specify the target array for the join.
 * @example
 * // Example of a source array where each object represents a person.
 * const persons = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
 *
 * // Initiating the left join operation with the source array.
 * const joinOperation = leftJoin(persons);
 */
export function leftJoin<T>(source: T[]) {
  return {
    /**
     * Specifies the target array to be joined with the source array.
     *
     * @param {U[]} target The target array for the join operation.
     * @returns An object with the `with` method, which is used to specify the joining key in the source array.
     * @example
     * // Example of a target array where each object represents an order.
     * const orders = [{ orderId: 101, customerId: 1, product: 'Book' }];
     *
     * // Specifying the target array for the join operation.
     * const joinWithTarget = joinOperation.in(orders);
     */
    in<U>(target: U[]) {
      return {
        /**
         * Specifies the key in the source array to join on.
         *
         * @template K Type of the key in the source array.
         * @param {K} sourceKey The key in the source array to use for the join.
         * @returns An object with the `matching` method, which is used to specify the corresponding key in the target array.
         * @example
         * // Specifying the key in the source array for the join operation.
         * const joinWithSourceKey = joinWithTarget.with('id');
         */
        with<K extends keyof T>(sourceKey: K) {
          return {
            /**
             * Specifies the key in the target array that matches the key in the source array.
             *
             * @template L Type of the key in the target array.
             * @param {L} targetKey The key in the target array that corresponds to the source key.
             * @returns {(T & Partial<U>)[]} An array resulting from the left join operation, with objects from the source array enriched with matching objects from the target array.
             * @example
             * // Executing the left join operation with the specified keys.
             * const result = joinWithSourceKey.matching('customerId');
             *
             * // The result is an array of objects from the source array (persons) enriched with data from the target array (orders) based on matching ids.
             * console.log(result);
             * // Output: [{ id: 1, name: 'Alice', orderId: 101, customerId: 1, product: 'Book' }]
             */
            matching<L extends keyof U>(targetKey: L): (T & Partial<U>)[] {
              const targetIndex = target.reduce(
                (acc: Record<string, U[]>, obj: U) => {
                  const keyValue = String(obj[targetKey]);
                  acc[keyValue] = acc[keyValue] || [];
                  acc[keyValue].push(obj);
                  return acc;
                },
                {}
              );

              return source.flatMap((srcObj) => {
                const keyValue = String(srcObj[sourceKey]);
                const matches = targetIndex[keyValue];
                if (matches && matches.length > 0) {
                  return structuredClone(
                    matches.map((match) => ({
                      ...srcObj,
                      ...match,
                    }))
                  );
                }
                return [{ ...structuredClone(srcObj) }];
              }) as (T & Partial<U>)[];
            },
          };
        },
      };
    },
  };
}

/**
 * Initiates an inner join operation between two arrays of objects based on separate keys in each array.
 * This function allows for flexible key matching between the source and target arrays, facilitating inner join operations where only matching pairs are included in the result.
 * Supports method chaining for specifying the target array, source key, and target key.
 *
 * @template T Type of objects in the source array.
 * @template U Type of objects in the target array.
 * @param {T[]} source The source array for the join.
 * @returns An object with the `.in(target)` method, allowing specification of the target array.
 * @example
 * // Source array of persons, each with a unique personId.
 * const persons = [{ personId: 1, name: 'Alice' }, { personId: 2, name: 'Bob' }];
 * // Target array of orders, each with a customerId linking back to a person.
 * const orders = [{ orderId: 101, customerId: 1, product: 'Book' }];
 * // Initiating the inner join operation.
 * const matchedPairs = innerJoin(persons).in(orders).with('personId').matching('customerId');
 */
export function innerJoin<T>(source: T[]) {
  return {
    /**
     * Specifies the target array to be joined with the source array.
     *
     * @param {U[]} target The target array for the join operation.
     * @returns An object with the `.with(sourceKey)` method, allowing specification of the source key for the join.
     * @example
     * // Continuing from the initiation of the innerJoin operation...
     * const joinWithTarget = innerJoin(persons).in(orders);
     */
    in<U>(target: U[]) {
      return {
        /**
         * Specifies the key in the source array to join on.
         *
         * @template K Type of the key in the source array.
         * @param {K} sourceKey The key in the source array to use for the join.
         * @returns An object with the `.matching(targetKey)` method, allowing specification of the corresponding target key.
         * @example
         * // Specifying the source key (personId from persons array).
         * const joinWithSourceKey = innerJoin(persons).in(orders).with('personId');
         */
        with<K extends keyof T>(sourceKey: K) {
          return {
            /**
             * Specifies the key in the target array that matches the key in the source array, completing the inner join operation setup.
             * The resulting operation will include only objects where a match is found between the source and target arrays based on the specified keys.
             *
             * @template L Type of the key in the target array.
             * @param {L} targetKey The key in the target array that corresponds to the source key.
             * @returns {(T & U)[]} An array resulting from the inner join operation, including only matched pairs.
             * @example
             * // Completing the inner join operation by specifying the target key (customerId from orders array) and executing the join.
             * const matchedPairs = innerJoin(persons).in(orders).with('personId').matching('customerId');
             * console.log(matchedPairs);
             * // Output: [{ personId: 1, name: 'Alice', orderId: 101, customerId: 1, product: 'Book' }]
             */
            matching<L extends keyof U>(targetKey: L): (T & U)[] {
              const targetIndex = target.reduce(
                (acc: Record<string, U[]>, obj: U) => {
                  const keyValue = String(obj[targetKey]);
                  acc[keyValue] = acc[keyValue] || [];
                  acc[keyValue].push(obj);
                  return acc;
                },
                {}
              );

              return source.flatMap((srcObj) => {
                const keyValue = String(srcObj[sourceKey]);
                const targetMatches = targetIndex[keyValue];
                if (targetMatches && targetMatches.length > 0) {
                  return structuredClone(
                    targetMatches.map((targetObj) => ({
                      ...srcObj,
                      ...targetObj,
                    }))
                  );
                }
                return [];
              });
            },
          };
        },
      };
    },
  };
}

/**
 * A utility function for operations on objects that promotes immutability and type safety.
 * It provides methods to pick specific keys, remove specific keys, and merge objects.
 * The initial call to `object` performs a deep clone of the provided object to ensure
 * that subsequent operations do not mutate the original object.
 *
 * @template T - The type of the input object, must extend `object`.
 * @param {T} obj - The original object to perform operations on.
 * @returns An object containing three methods: `pickKeys`, `removeKeys`, and `merge`.
 *
 */
export function object<T extends object>(
  obj: T,
  options: StructuredSerializeOptions
) {
  const clonedObj = deepClone(obj, options); // Assume deepClone is implemented and is type-safe

  return {
    /**
     * Picks and returns a new object with only the specified keys from the original object.
     * @template K - The keys to pick from the original object.
     * @param {...K[]} keys - The keys to pick.
     * @returns {Pick<T, K>} A new object containing only the specified keys.
     * @example
     * // Pick specific keys from an object
     * const original = { name: 'John Doe', age: 30, city: 'New York' };
     * const picked = object(original).pickKeys('name', 'city');
     * console.log(picked); // Output: { name: 'John Doe', city: 'New York' }
     */
    pickKeys<K extends keyof T>(...keys: K[]): Pick<T, K> {
      const pickedObj = {} as Pick<T, K>;
      keys.forEach((key) => {
        if (key in clonedObj) {
          pickedObj[key] = clonedObj[key];
        }
      });
      return pickedObj;
    },

    /**
     * Removes the specified keys from the original object and returns a new object.
     * @template K - The keys to remove from the original object.
     * @param {...K[]} keys - The keys to remove.
     * @returns {Omit<T, K>} A new object with the specified keys omitted.
     * @example
     * // Remove specific keys from an object
     * const reduced = object(original).removeKeys('age');
     * console.log(reduced); // Output: { name: 'John Doe', city: 'New York' }
     */
    removeKeys<K extends keyof T>(...keys: K[]): Omit<T, K> {
      const result = Object.entries(clonedObj)
        .filter(([key]) => !keys.includes(key as K))
        .reduce(
          (acc, [key, value]) => ({ ...acc, [key]: value }),
          {} as Omit<T, K>
        );
      return result;
    },

    /**
     * Merges one or more objects into the original object and returns a new object.
     * @template M - The types of the mixin objects to be merged.
     * @param {...M} mixins - The objects to merge with the original object.
     * @returns {T & UnionToIntersection<M[number]>} A new object that combines the original object with the mixin objects.
     * @example
     * // Merge objects
     * const additional = { country: 'USA', occupation: 'Engineer' };
     * const merged = object(original).merge(additional);
     * console.log(merged); // Output: { name: 'John Doe', age: 30, city: 'New York', country: 'USA', occupation: 'Engineer' }
     */
    merge<M extends object[]>(
      ...mixins: M
    ): T & UnionToIntersection<M[number]> {
      const resultObject = mixins.reduce((acc, mixin) => {
        return { ...acc, ...mixin };
      }, clonedObj);
      return resultObject as T & UnionToIntersection<M[number]>;
    },

    /**
     * Deeply clones the current object, ensuring no references are shared with the original object.
     *
     * @returns {T} A deep clone of the current object.
     *
     * @example
     * const cloned = object(original).deepClone();
     * console.log(cloned); // Output: Deep clone of the original object
     */
    deepClone(): T {
      return deepClone(clonedObj, options);
    },

    /**
     * Recursively freezes the current object, making it immutable.
     *
     * @returns {T} The current object after being deeply frozen.
     *
     * @example
     * const frozen = object(original).deepFreeze();
     * console.log(frozen); // Output: The original object deeply frozen
     */
    deepFreeze(): T {
      return deepFreeze(clonedObj);
    },

    /**
     * Compares the current object with another object to determine if they are deeply equal.
     *
     * @param {T} otherObj - The object to compare with the current object.
     * @returns {boolean} True if the objects are deeply equal, false otherwise.
     *
     * @example
     * const isEqual = object(original).deepCompare(anotherObject);
     * console.log(isEqual); // Output: true or false
     */
    deepCompare(otherObj: T): boolean {
      return deepEqual(clonedObj, otherObj);
    },
  };
}

type Primitive = string | number | boolean;
type ComplexObject =
  | object
  | Array<ArrayElement>
  | Set<Primitive>
  | Map<Primitive, Primitive>;

export type ArrayElement = Primitive | ComplexObject;

/**
 * Removes duplicate elements from an array. This function supports a wide range
 * of element types, including objects, arrays, Sets, Maps, strings, numbers,
 * and booleans. For complex structures like objects, arrays, Sets, and Maps,
 * duplicates are identified by their serialized JSON string representation.
 * This ensures that elements with the same structure but different references
 * are considered duplicates. Primitives like strings, numbers, and booleans
 * are compared directly.
 *
 * Dont use objects with methods or functions, as they will be stringified and
 *
 * Note: Using JSON.stringify for comparison may have limitations, such as not
 * properly handling circular references or special object types like Date.
 *
 * @param {ArrayElement[]} array - The array from which to remove duplicates.
 *                                  The array can contain elements of various types.
 * @returns {ArrayElement[]} A new array with duplicates removed.
 *
 * @example
 * // Remove duplicates from an array of objects, arrays, and primitives
 * const data = [
 *   new Set([1, 2, 3]), new Set([1, 2, 3]),
 *   new Map([['key', 'value']]), new Map([['key', 'value']])
 * ];
 * const uniqueData = removeDuplicates(data);
 * console.log(uniqueData);
 *
 * @example
 * // Remove duplicates from an array of strings and numbers
 * const primitives = [1, 2, 2, 'hello', 'world', 'hello'];
 * const uniquePrimitives = removeDuplicates(primitives);
 * console.log(uniquePrimitives);
 */

export function removeDuplicatesFromArray<T>(array: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];

  array.forEach((item) => {
    const key = JSON.stringify(item, (_, value) => {
      if (value instanceof Set) {
        return Array.from(value);
      }

      if (value instanceof Map) {
        return Array.from(value.entries());
      }

      return value;
    });

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  });

  return result;
}
export function buildOptionalObject<T extends object>(fields: T): Partial<T> {
  return Object.entries(fields).reduce((obj, [key, value]) => {
    if (value !== undefined) {
      obj[key as keyof T] = value;
    }
    return obj;
  }, {} as Partial<T>);
}

const person = {
  name: "Alice",
  age: 30,
  city: "New York",
};

const picked = object(person).removeKeys("city", "city");

const obj = {
  name: "Alice",
  age: 30,
  city: "New York",
};

const newObject = object(obj).merge({ country: "USA" });
