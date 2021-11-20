import { Store, UnknownState, StoreInitializer } from '../vanilla'

// ============================================================================
// Types

type SubscribeWithSelector = 
  <T extends UnknownState, S extends Store<T>>
    (storeInitializer: StoreInitializer<T, S>) =>
      StoreInitializer<T, S & SubscribeWithSelectorStore<T>>

interface SubscribeWithSelectorStore<T extends UnknownState>
  { subscribe:
      <U>
        ( selector: (state: T) => U
        , listener: (selectedState: U, previousSelectedState: U) => void
        , options?:
            { equalityFn?: (a: U, b: U) => boolean
            , fireImmediately?: boolean
            }
        ) =>
          () => void
  }


// ============================================================================
// Implementation

type EState = { __isState: true }
type ESelectedState = { __isSelectedState: true }
type EStore = Store<EState>
type ESubscribeWithSelector = 
  (storeInitializer: StoreInitializer<EState, EStore>) =>
    StoreInitializer<EState, EStore & ESubscribeWithSelectorStore>

interface ESubscribeWithSelectorStore
  { subscribe:
    ( selector: (state: EState) => ESelectedState
    , listener:
        ( selectedState: ESelectedState
        , previousSelectedState: E.Previous<ESelectedState>
        )
          => void
    , options?:
        { equalityFn?: (a: ESelectedState, b: ESelectedState) => boolean
        , fireImmediately?: boolean
        }
    ) =>
      () => void
  }

const subscribeWithSelectorImpl: ESubscribeWithSelector =
  storeInitializer =>
    (parentSet, parentGet, parentStore) => {

  let parentSubscribe = parentStore.subscribe
  let updatedParentStore = parentStore as EStore & ESubscribeWithSelectorStore
  type UpdatedSubscribeArguments = F.O2.Arguments<(typeof updatedParentStore)['subscribe']>

  updatedParentStore.subscribe = (...args: UpdatedSubscribeArguments) => {
    if (!args[1]) {
      pseudoAssert(args.length === 1)
      return parentSubscribe(...args)
    }
  
    pseudoAssert(args.length === 3)
    let [selector, listener, _options] = args
    let { equalityFn: equals, fireImmediately } =
      { equalityFn: objectIs, fireImmediately: false, ..._options }
  
    let currentSelected = selector(parentGet())
    let previousSelected = currentSelected as E.Previous<ESelectedState>
    const emit = () => listener(currentSelected, previousSelected)

    let unsubscribe = parentSubscribe(() => {
      let nextSelected = selector(parentGet())
      if (equals(currentSelected, nextSelected)) return
  
      previousSelected = E.previous(currentSelected)
      currentSelected = nextSelected
      emit()
    })
    if (fireImmediately) emit()

    return unsubscribe
  }

  return storeInitializer(parentSet, parentGet, updatedParentStore)
}
const subscribeWithSelector = subscribeWithSelectorImpl as SubscribeWithSelector


// ============================================================================
// Utilities

namespace E {
  export type Previous<T> = T & { __isPrevious: true }
  export const previous = <T>(t: T) => t as Previous<T>
}

const objectIs =
  Object.is as (<T>(a: T, b: T) => boolean)

function pseudoAssert<T extends boolean>(predicate: T):
  asserts predicate {}

namespace F {
  export namespace O2 {
    export type Arguments<T> =
      T extends {
        (...a: infer A1): unknown 
        (...a: infer A2): unknown 
      }
        ? A1 | A2
        : never
  }
}

// ============================================================================
// Exports

export { subscribeWithSelector, SubscribeWithSelectorStore }