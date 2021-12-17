import { GetState, PartialState, SetState, State, StoreApi } from '../vanilla'

type DevtoolsType = {
  /**
   * @deprecated along with `api.devtools`, `api.devtools.prefix` is deprecated.
   * We no longer prefix the actions/names, because the `name` option already
   * creates a separate instance of devtools for each store.
   */
  prefix: string
  subscribe: (dispatch: any) => () => void
  unsubscribe: () => void
  send: {
    (action: string | { type: unknown }, state: any): void
    (action: null, liftedState: any): void
  }
  init: (state: any) => void
  error: (payload: any) => void
}

export type NamedSet<T extends State> = {
  <
    K1 extends keyof T,
    K2 extends keyof T = K1,
    K3 extends keyof T = K2,
    K4 extends keyof T = K3
  >(
    partial: PartialState<T, K1, K2, K3, K4>,
    replace?: boolean,
    name?: string | { type: unknown }
  ): void
}

export type StoreApiWithDevtools<T extends State> = StoreApi<T> & {
  setState: NamedSet<T>
  /**
   * @deprecated `devtools` property on the store is deprecated
   * it will be removed in the next major.
   * You shouldn't interact with the extension directly. But in case you still want to
   * you can patch `window.__REDUX_DEVTOOLS_EXTENSION__` directly
   */
  devtools?: DevtoolsType
}

type ActionCreator = (...a: unknown[]) => { type: unknown }

interface DevtoolsOptions<S> {
  /**
   * the instance name to be showed on the monitor page. Default value is `document.title`.
   * If not specified and there's no document title, it will consist of `tabId` and `instanceId`.
   */
  name?: string

  /**
   * The action type to send when `setState` is called without a type.
   * @default "anonymous"
   */
  anonymousActionType?: string
  /**
   * action creators functions to be available in the Dispatcher.
   */
  actionCreators?: ActionCreator[] | { [key: string]: ActionCreator }
  /**
   * if more than one action is dispatched in the indicated interval, all new actions will be collected and sent at once.
   * It is the joint between performance and speed. When set to `0`, all actions will be sent instantly.
   * Set it to a higher value when experiencing perf issues (also `maxAge` to a lower value).
   *
   * @default 500 ms.
   */
  latency?: number
  /**
   * (> 1) - maximum allowed actions to be stored in the history tree. The oldest actions are removed once maxAge is reached. It's critical for performance.
   *
   * @default 50
   */
  maxAge?: number
  /**
   * - `undefined` - will use regular `JSON.stringify` to send data (it's the fast mode).
   * - `false` - will handle also circular references.
   * - `true` - will handle also date, regex, undefined, error objects, symbols, maps, sets and functions.
   * - object, which contains `date`, `regex`, `undefined`, `error`, `symbol`, `map`, `set` and `function` keys.
   *   For each of them you can indicate if to include (by setting as `true`).
   *   For `function` key you can also specify a custom function which handles serialization.
   *   See [`jsan`](https://github.com/kolodny/jsan) for more details.
   */
  serialize?:
    | boolean
    | {
        date?: boolean
        regex?: boolean
        undefined?: boolean
        error?: boolean
        symbol?: boolean
        map?: boolean
        set?: boolean
        // eslint-disable-next-line @typescript-eslint/ban-types
        function?: boolean | Function
      }
  /**
   * function which takes `action` object and id number as arguments, and should return `action` object back.
   */
  actionSanitizer?: <A extends { type: unknown }>(action: A, id: number) => A
  /**
   * function which takes `state` object and index as arguments, and should return `state` object back.
   */
  stateSanitizer?: (state: S, index: number) => S
  /**
   * *string or array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsWhitelist` specified, `actionsBlacklist` is ignored.
   * @deprecated Use actionsDenylist instead.
   */
  actionsBlacklist?: string | string[]
  /**
   * *string or array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsWhitelist` specified, `actionsBlacklist` is ignored.
   * @deprecated Use actionsAllowlist instead.
   */
  actionsWhitelist?: string | string[]
  /**
   * *string or array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsAllowlist` specified, `actionsDenylist` is ignored.
   */
  actionsDenylist?: string | string[]
  /**
   * *string or array of strings as regex* - actions types to be hidden / shown in the monitors (while passed to the reducers).
   * If `actionsAllowlist` specified, `actionsDenylist` is ignored.
   */
  actionsAllowlist?: string | string[]
  /**
   * called for every action before sending, takes `state` and `action` object, and returns `true` in case it allows sending the current data to the monitor.
   * Use it as a more advanced version of `actionsDenylist`/`actionsAllowlist` parameters.
   */
  predicate?: <A extends { type: unknown }>(state: S, action: A) => boolean
  /**
   * if specified as `false`, it will not record the changes till clicking on `Start recording` button.
   * Available only for Redux enhancer, for others use `autoPause`.
   *
   * @default true
   */
  shouldRecordChanges?: boolean
  /**
   * if specified, whenever clicking on `Pause recording` button and there are actions in the history log, will add this action type.
   * If not specified, will commit when paused. Available only for Redux enhancer.
   *
   * @default "@@PAUSED""
   */
  pauseActionType?: string
  /**
   * auto pauses when the extension’s window is not opened, and so has zero impact on your app when not in use.
   * Not available for Redux enhancer (as it already does it but storing the data to be sent).
   *
   * @default false
   */
  autoPause?: boolean
  /**
   * if specified as `true`, it will not allow any non-monitor actions to be dispatched till clicking on `Unlock changes` button.
   * Available only for Redux enhancer.
   *
   * @default false
   */
  shouldStartLocked?: boolean
  /**
   * if set to `false`, will not recompute the states on hot reloading (or on replacing the reducers). Available only for Redux enhancer.
   *
   * @default true
   */
  shouldHotReload?: boolean
  /**
   * if specified as `true`, whenever there's an exception in reducers, the monitors will show the error message, and next actions will not be dispatched.
   *
   * @default false
   */
  shouldCatchErrors?: boolean
  /**
   * If you want to restrict the extension, specify the features you allow.
   * If not specified, all of the features are enabled. When set as an object, only those included as `true` will be allowed.
   * Note that except `true`/`false`, `import` and `export` can be set as `custom` (which is by default for Redux enhancer), meaning that the importing/exporting occurs on the client side.
   * Otherwise, you'll get/set the data right from the monitor part.
   */
  features?: {
    /**
     * start/pause recording of dispatched actions
     */
    pause?: boolean
    /**
     * lock/unlock dispatching actions and side effects
     */
    lock?: boolean
    /**
     * persist states on page reloading
     */
    persist?: boolean
    /**
     * export history of actions in a file
     */
    export?: boolean | 'custom'
    /**
     * import history of actions from a file
     */
    import?: boolean | 'custom'
    /**
     * jump back and forth (time travelling)
     */
    jump?: boolean
    /**
     * skip (cancel) actions
     */
    skip?: boolean
    /**
     * drag and drop actions in the history list
     */
    reorder?: boolean
    /**
     * dispatch custom actions or action creators
     */
    dispatch?: boolean
    /**
     * generate tests for the selected actions
     */
    test?: boolean
  }
  /**
   * Set to true or a stacktrace-returning function to record call stack traces for dispatched actions.
   * Defaults to false.
   */
  trace?: boolean | (<A extends { type: unknown }>(action: A) => string)
  /**
   * The maximum number of stack trace entries to record per action. Defaults to 10.
   */
  traceLimit?: number
}

export const devtools =
  <
    S extends State,
    CustomSetState extends SetState<S>,
    CustomGetState extends GetState<S>,
    CustomStoreApi extends StoreApi<S>
  >(
    fn: (set: NamedSet<S>, get: CustomGetState, api: CustomStoreApi) => S,
    options?: string | DevtoolsOptions<S>
  ) =>
  (
    set: CustomSetState,
    get: CustomGetState,
    api: CustomStoreApi &
      StoreApiWithDevtools<S> & {
        dispatch?: unknown
        dispatchFromDevtools?: boolean
      }
  ): S => {
    const devtoolsOptions =
      options === undefined
        ? { name: undefined, anonymousActionType: undefined }
        : typeof options === 'string'
        ? { name: options }
        : options

    if (typeof window === 'undefined') {
      return fn(set, get, api)
    }

    const extensionConnector =
      (window as any).__REDUX_DEVTOOLS_EXTENSION__ ||
      (window as any).top.__REDUX_DEVTOOLS_EXTENSION__

    if (!extensionConnector) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[zustand devtools middleware] Please install/enable Redux devtools extension'
        )
      }
      return fn(set, get, api)
    }

    let extension = Object.create(extensionConnector.connect(devtoolsOptions))
    // We're using `Object.defineProperty` to set `prefix`, so if extensionConnector.connect
    // returns the same reference we'd get cannot redefine property prefix error
    // hence we `Object.create` to make a new reference

    let didWarnAboutDevtools = false
    Object.defineProperty(api, 'devtools', {
      get: () => {
        if (!didWarnAboutDevtools) {
          console.warn(
            '[zustand devtools middleware] `devtools` property on the store is deprecated ' +
              'it will be removed in the next major.\n' +
              "You shouldn't interact with the extension directly. But in case you still want to " +
              'you can patch `window.__REDUX_DEVTOOLS_EXTENSION__` directly'
          )
          didWarnAboutDevtools = true
        }
        return extension
      },
      set: (value) => {
        if (!didWarnAboutDevtools) {
          console.warn(
            '[zustand devtools middleware] `api.devtools` is deprecated, ' +
              'it will be removed in the next major.\n' +
              "You shouldn't interact with the extension directly. But in case you still want to " +
              'you can patch `window.__REDUX_DEVTOOLS_EXTENSION__` directly'
          )
          didWarnAboutDevtools = true
        }
        extension = value
      },
    })

    let didWarnAboutPrefix = false
    Object.defineProperty(extension, 'prefix', {
      get: () => {
        if (!didWarnAboutPrefix) {
          console.warn(
            '[zustand devtools middleware] along with `api.devtools`, `api.devtools.prefix` is deprecated.\n' +
              'We no longer prefix the actions/names' +
              devtoolsOptions.name ===
              undefined
              ? ', pass the `name` option to create a separate instance of devtools for each store.'
              : ', because the `name` option already creates a separate instance of devtools for each store.'
          )
          didWarnAboutPrefix = true
        }
        return ''
      },
      set: () => {
        if (!didWarnAboutPrefix) {
          console.warn(
            '[zustand devtools middleware] along with `api.devtools`, `api.devtools.prefix` is deprecated.\n' +
              'We no longer prefix the actions/names' +
              devtoolsOptions.name ===
              undefined
              ? ', pass the `name` option to create a separate instance of devtools for each store.'
              : ', because the `name` option already creates a separate instance of devtools for each store.'
          )
          didWarnAboutPrefix = true
        }
      },
    })

    let isRecording = true
    ;(api.setState as NamedSet<S>) = (state, replace, nameOrAction) => {
      set(state, replace)
      if (!isRecording) return
      extension.send(
        nameOrAction === undefined
          ? { type: devtoolsOptions.anonymousActionType || 'anonymous' }
          : typeof nameOrAction === 'string'
          ? { type: nameOrAction }
          : nameOrAction,
        get()
      )
    }
    const setStateFromDevtools: SetState<S> = (...a) => {
      isRecording = false
      set(...a)
      isRecording = true
    }

    const initialState = fn(api.setState, get, api)
    extension.init(initialState)

    extension.subscribe((message: any) => {
      switch (message.type) {
        case 'ACTION':
          return parseJsonThen<{ type: unknown; state?: PartialState<S> }>(
            message.payload,
            (action) => {
              if (action.type === '__setState') {
                setStateFromDevtools(action.state as PartialState<S>)
                return
              }

              if (!api.dispatchFromDevtools) return
              if (typeof api.dispatch !== 'function') return
              ;(api.dispatch as any)(action)
            }
          )

        case 'DISPATCH':
          switch (message.payload.type) {
            case 'RESET':
              setStateFromDevtools(initialState)
              return extension.init(api.getState())

            case 'COMMIT':
              return extension.init(api.getState())

            case 'ROLLBACK':
              return parseJsonThen<S>(message.state, (state) => {
                setStateFromDevtools(state)
                extension.init(api.getState())
              })

            case 'JUMP_TO_STATE':
            case 'JUMP_TO_ACTION':
              return parseJsonThen<S>(message.state, (state) => {
                setStateFromDevtools(state)
              })

            case 'IMPORT_STATE': {
              const { nextLiftedState } = message.payload
              const lastComputedState =
                nextLiftedState.computedStates.slice(-1)[0]?.state
              if (!lastComputedState) return
              setStateFromDevtools(lastComputedState)
              extension.send(null, nextLiftedState)
              return
            }

            case 'PAUSE_RECORDING':
              return (isRecording = !isRecording)
          }
          return
      }
    })

    if (api.dispatchFromDevtools && typeof api.dispatch === 'function') {
      let didWarnAboutReservedActionType = false
      const originalDispatch = api.dispatch
      api.dispatch = (...a: any[]) => {
        if (a[0].type === '__setState' && !didWarnAboutReservedActionType) {
          console.warn(
            '[zustand devtools middleware] "__setState" action type is reserved ' +
              'to set state from the devtools. Avoid using it.'
          )
          didWarnAboutReservedActionType = true
        }
        ;(originalDispatch as any)(...a)
      }
    }

    return initialState
  }

const parseJsonThen = <T>(stringified: string, f: (parsed: T) => void) => {
  let parsed: T | undefined
  try {
    parsed = JSON.parse(stringified)
  } catch (e) {
    console.error(
      '[zustand devtools middleware] Could not parse the received json',
      e
    )
  }
  if (parsed !== undefined) f(parsed as T)
}
