import React, {
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import EventEmitter from 'eventemitter3';

const context = createContext();

const INIT = Symbol('Init');
export const ROUTER_ERROR = Symbol('Error');
export const ROUTER_LOADING = Symbol('Loading');

const routerEvents = new EventEmitter();

export const replace = (route) => {
  routerEvents.emit('replace', route);
};

let counter = 0;

export const StateRouterProvider = ({ children, routes, initialRoute }) => {
  const [blockState, setBlockState] = useState({
    route: INIT,
  });

  const setBlockStateWithProps = useCallback(async (nextBlockState) => {
    let initialProps = {};

    counter += 1;
    const ticket = counter;

    const { route } = nextBlockState;

    if (routes[route] && routes[route].getInitialProps) {
      setBlockState({
        route: ROUTER_LOADING,
      });

      try {
        initialProps = await routes[route].getInitialProps();

        // bail
        if (counter === ticket) {
          setBlockState({
            ...nextBlockState,
            initialProps,
          });
        }
      } catch (error) {
        // bail
        if (counter === ticket) {
          setBlockState({
            route: ROUTER_ERROR,
          });
        }

        // eslint-disable-next-line no-console
        console.log(error);
      }

      return;
    }

    setBlockState(nextBlockState);
  }, [routes, setBlockState]);

  useEffect(() => {
    const handleRedirect = (route) => {
      if (route) {
        setBlockStateWithProps({
          route,
        });
      }
    };

    // listen first
    routerEvents.on('replace', handleRedirect);

    // initialize after — so we can catch errors during init
    if (blockState.route === INIT) {
      setBlockStateWithProps({
        route: initialRoute,
      });
    }

    return () => {
      routerEvents.removeListener(handleRedirect);
    };
  }, [blockState, initialRoute, setBlockStateWithProps]);

  const contextValue = useMemo(() => [
    blockState, setBlockStateWithProps,
  ], [blockState, setBlockStateWithProps]);

  return (
    <context.Provider value={contextValue}>
      {children}
    </context.Provider>
  );
};

const useStateRouter = () => useContext(context);

export default useStateRouter;
