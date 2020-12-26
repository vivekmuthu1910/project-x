import { promises as fs } from 'fs';
import { parse } from 'path';

function join(segs, joinChar, options) {
  if (typeof options.join === 'function') {
    return options.join(segs);
  }
  return segs[0] + joinChar + segs[1];
}

function split(path, splitChar, options) {
  if (typeof options.split === 'function') {
    return options.split(path);
  }
  return path.split(splitChar);
}

function isValid(key, target, options) {
  if (typeof options.isValid === 'function') {
    return options.isValid(key, target);
  }
  return true;
}

function isValidObject(val) {
  return isObject(val) || Array.isArray(val) || typeof val === 'function';
}

function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
}

export class EditJsonFile {
  private obj: Object;

  private _initialized = false;

  constructor(private jsonPath: string, options?: any) {
    this.initializeObj();
  }

  async initializeObj() {
    try {
      const fileCont = await fs.readFile(this.jsonPath);
      this.obj = JSON.parse(fileCont.toString());
    } catch (error) {
      this.obj = {};
      const fileDir = parse(this.jsonPath).dir;
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(this.jsonPath, JSON.stringify(this.obj));
    }
  }

  private _isObject() {}

  private _isPlain() {}

  set<T, K extends keyof T>(prop: K, value: T[K]) {}

  get(path: string | string[], options?: get.Options): any {
    let target = this.obj;
    if (!isObject(options)) {
      options = { default: options };
    }

    if (!isValidObject(target)) {
      return typeof options.default !== 'undefined' ? options.default : target;
    }

    if (typeof path === 'number') {
      path = String(path);
    }

    const isArray = Array.isArray(path);
    const isString = typeof path === 'string';
    const splitChar = options.separator || '.';
    const joinChar =
      options.joinChar || (typeof splitChar === 'string' ? splitChar : '.');

    if (!isString && !isArray) {
      return target;
    }

    if (typeof path === 'string' && path in target) {
      return isValid(path, target, options) ? target[path] : options.default;
    }

    let segs = isArray ? path : split(path, splitChar, options);
    let len = segs.length;
    let idx = 0;

    do {
      let prop = segs[idx];
      if (typeof prop === 'number') {
        prop = String(prop);
      }

      while (prop && prop.slice(-1) === '\\') {
        prop = join([prop.slice(0, -1), segs[++idx] || ''], joinChar, options);
      }

      if (prop in target) {
        if (!isValid(prop, target, options)) {
          return options.default;
        }

        target = target[prop];
      } else {
        let hasProp = false;
        let n = idx + 1;

        while (n < len) {
          prop = join([prop, segs[n++]], joinChar, options);

          if ((hasProp = prop in target)) {
            if (!isValid(prop, target, options)) {
              return options.default;
            }

            target = target[prop];
            idx = n - 1;
            break;
          }
        }

        if (!hasProp) {
          return options.default;
        }
      }
    } while (++idx < len && isValidObject(target));

    if (idx === len) {
      return target;
    }

    return options.default;
  }
}

declare namespace get {
  interface Options {
    /**
     * The default value to return when get-value cannot result a value from the given object.
     *
     * default: `undefined`
     */
    default?: any;
    /**
     * If defined, this function is called on each resolved value.
     * Useful if you want to do `.hasOwnProperty` or `Object.prototype.propertyIsEnumerable`.
     */
    isValid?: <K extends string>(key: K, object: Record<K, any>) => boolean;
    /**
     * Custom function to use for splitting the string into object path segments.
     *
     * default: `String.split`
     */
    split?: (s: string) => string[];
    /**
     * The separator to use for spliting the string.
     * (this is probably not needed when `options.split` is used).
     *
     *  default: `"."`
     */
    separator?: string | RegExp;
    /**
     * Customize how the object path is created when iterating over path segments.
     *
     * default: `Array.join`
     */
    join?: (segs: string[]) => string;
    /**
     * The character to use when re-joining the string to check for keys
     * with dots in them (this is probably not needed when `options.join` is used).
     * This can be a different value than the separator, since the separator can be a string or regex.
     *
     * default: `"."`
     */
    joinChar?: string;
  }
}
