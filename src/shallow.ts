type JsonOrFunction = 
  | string
  | number
  | symbol
  | undefined
  | null
  | bigint
  | { [K in string | number]: JsonOrFunction }
  | JsonOrFunction[]
  | ((...a: never[]) => unknown)

function shallow<T extends JsonOrFunction, U extends JsonOrFunction>(objA: T, objB: U) {
  if (Object.is(objA, objB)) {
    return true
  }
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }
  const keysA = Object.keys(objA)
  if (keysA.length !== Object.keys(objB).length) {
    return false
  }
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      !Object.is(objA[keysA[i] as any], objB[keysA[i] as any])
    ) {
      return false
    }
  }
  return true
}

export default shallow
