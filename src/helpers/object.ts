export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

export function isKeyValueObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function getObjectProperty(object: object, path: string): unknown {
  return path.split('.').reduce((accumulator, part) => (accumulator as any)?.[part], object);
}

export function filterNullishValues(object: Record<string, any>): Record<string, any> {
  Object.keys(object).forEach(key => {
    if (object[key] == null) {
      delete object[key];
    }
  });

  return object;
}

export const extend = Object.assign;
