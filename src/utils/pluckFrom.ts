/**
 * function to pluck properties from an object
 * @param obj
 * @param props
 */
export function pluckFrom<T, K extends keyof T>(obj: T, ...props: K[]) {
  const result = {} as Pick<T,K>;
  props.forEach(prop => (result[prop] = obj[prop]));
  return result;
}

