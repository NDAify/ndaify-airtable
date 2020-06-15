import React from 'react';
import {
    initializeBlock,
    Box,
    Loader,
    loadCSSFromString,
    loadCSSFromURLAsync,
    useGlobalConfig,
    Button
} from '@airtable/blocks/ui';

import { viewport } from '@airtable/blocks';

import Home from './components/Home/Home';

import useStateRouter, { ROUTER_LOADING, ROUTER_ERROR, StateRouterProvider } from './lib/useStateRouter';
import Greeting from './components/Greeting/Greeting';
import Wizard from './components/Wizard/Wizard';
import SessionError from './components/SessionError/SessionError';


const darkVars = `
  --ndaify-bg: 66,70,87;
  --ndaify-fg: #FFFFFF;

  --ndaify-accents-0: #000000;
  --ndaify-accents-1: #111111;
  --ndaify-accents-2: #333333;
  --ndaify-accents-3: #444444;
  --ndaify-accents-4: #666666;
  --ndaify-accents-5: #888888;
  --ndaify-accents-6: #999999;
  --ndaify-accents-7: #EAEAEA;
  --ndaify-accents-8: #FAFAFA;
  --ndaify-accents-9: #EDD9A3;

  --ndaify-accents-primary: #CEB778;
  --ndaify-accents-secondary: #0F96CC;
  --ndaify-accents-success: #4AC09A;
  --ndaify-accents-info: #9E82E0;
  --ndaify-accents-warning: #DFA907;
  --ndaify-accents-danger: #DC564A;

  --ndaify-accents-radius-1: 4px;
  --ndaify-accents-radius-2: 8px;
  --ndaify-accents-radius-3: 12px;
  --ndaify-input-radius: 4px;
  --ndaify-button-radius: 4px;

  --ndaify-input-bg: #FFFFFF;
  --ndaify-input-fg: #424657;
  --ndaify-input-placeholder-color: #AAAAAA;
  --ndaify-input-disabled-bg: #AAAAAA;

  --ndaify-button-fg: #FFFFFF;
  
  --ndaify-bg-overlay: #383B49;
  --ndaify-user-action-bg: #5dbfc8;
  --ndaify-link-color: var(--ndaify-fg);
  --ndaify-signature-line: #F1E65D;
  --ndaify-portal-opacity: 0.8;
`;

loadCSSFromURLAsync('https://fonts.googleapis.com/css2?family=Raleway:wght@200;400;700&display=swap');
loadCSSFromString(`
    :root {
      ${darkVars}
    }

    body { 
      background-color: rgb(var(--ndaify-bg));
      font-family: 'Raleway', sans-serif;
      font-weight: 200;
      height: 100%;
    }
`);

viewport.addMaxFullscreenSize({
    height: 600,
    width: 540,
});

const Loading = () => (
  <Box 
    height="100vh"   
    width="100vw"           
    display="flex" 
    justifyContent="center" 
    alignItems="center"
  >
    <Loader scale={0.5} />;
  </Box>
);

const Error = () => (
  <Box 
    height="100vh"   
    width="100vw"           
    display="flex" 
    justifyContent="center" 
    alignItems="center"
    backgroundColor="red"
    textColor="#FFFFFF"
  >
    Something bad happened, please reload the block.
  </Box>
);

const ROUTES = {
  home: Home, 
  greeting: Greeting,
  wizard: Wizard, 
  sessionError: SessionError, 
  [ROUTER_ERROR]: Error, 
  [ROUTER_LOADING]: Loading, 
};

const NDAifyApp = () => {
    const [blockState] = useStateRouter();

    const Komponent = ROUTES[blockState.route];

    if (Komponent) {
        return (
            <Komponent {...blockState.initialProps} />
        );
    }

    return null;
}

const NDAifyBlock = () => {
  const globalConfig = useGlobalConfig();

  const ndaifyApiKey = globalConfig.get('NDAIFY_API_KEY');

  return (
    <StateRouterProvider 
      routes={ROUTES} 
      initialRoute={(ndaifyApiKey ? 'home' : 'greeting')}
    >
      <NDAifyApp />
    </StateRouterProvider>
  );
};

initializeBlock(() => <NDAifyBlock />);