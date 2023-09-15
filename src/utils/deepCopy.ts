const mapTag = '[object Map]'
const setTag = '[object Set]'
const arrayTag = '[object Array]'
const objectTag = '[object Object]'
const symbolTag = '[object Symbol]'

export default function deepCopy(target: any, map = new WeakMap()) {
  if (!target || !isObject(target) || isNode(target)) {
    return target;
  }

  const objType = getObjectType(target);
  const result = createObj(target, objType);

  if (map.get(target)) {
    return map.get(target);
  }

  map.set(target, result);

  if (objType === setTag) {
    for (const value of target) {
      result.add(deepCopy(value, map));
    }

    return result;
  }

  if (objType === mapTag) {
    for (const [key, value] of target) {
      result.set(key, deepCopy(value, map));
    }
    return result;
  }

  if (objType === objectTag || objType === arrayTag) {
    for (const key in target) {
      result[key] = deepCopy(target[key], map);
    }
    return result;
  }

  return result;
}



function isNode (node: any) {
  return typeof node?.ELEMENT_NODE === 'number'
}

function getObjectType(obj: any) {
  return Object.prototype.toString.call(obj);
}

function createObj(obj: any, type: string) {
  if (type === objectTag) return {};
  if (type === arrayTag) return [];
  if (type === symbolTag) return Object(Symbol.prototype.valueOf.call(obj))

  return new obj.constructor(obj);
}

function isObject(target: any) {
  return typeof target === 'object';
}