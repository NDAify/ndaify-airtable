import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';

import * as Airtable from '@airtable/blocks/ui';
import {
  useViewport,
} from '@airtable/blocks/ui';

import SettingsButton from '../SettingsButton/SettingButton';
import Pager from '../Pager/Pager';
import Bradning from '../Branding/Branding';
import useStateRouter from '../../lib/useStateRouter';

const Paragraph = styled.div`
  color: var(--ndaify-accents-6);
  margin: 0;
  padding: 0;
  font-size: 20px;
  font-weight: 400;
  line-height: 28px;
`;

const NDAifyHeading = styled.div`
  margin: 0; 
  padding: 0; 
  color: var(--ndaify-fg); 
  font-size: 32px;
  font-weight: 200;
`;

const Greeting = () => {
  const [, setBlockState] = useStateRouter();

  const viewport = useViewport();

  const handleGetStartedClick = async () => {
    // const ndaifyService = new NdaifyService();

    // try {
    //     const response = await ndaifyService.getSession();
    //     console.log('response', response);
    // } catch (error) {
    //     console.error(error);
    // }

    setBlockState({
      route: 'wizard',
    });
  };
  const onGetStartedClick = useCallback(handleGetStartedClick, [viewport]);

  // const toggleFullscreen = () => {
  //     if (viewport.isFullscreen) {
  //         viewport.exitFullscreen();
  //     } else {
  //         viewport.enterFullscreenIfPossible();
  //     }
  // };

  useEffect(() => {
    viewport.enterFullscreenIfPossible();
  }, [viewport]);

  return (
    <>
      <SettingsButton show={false} />
      <Airtable.Box>
        <Airtable.Box>
          <Airtable.Box height="calc(100vh - 80px)" overflow="scroll" display="flex" flexDirection="column" marginBottom="80px">
            <Bradning />
            <Airtable.Box padding="2pc 2pc 4pc 2pc" margin="0">
              <NDAifyHeading style={{ paddingBottom: '1pc' }}>
                Welcome to NDAify
              </NDAifyHeading>
              <Paragraph>
                You can use NDAify to easily send nondisclousre agreements
                {' '}
                to email addresses in your base.
              </Paragraph>
            </Airtable.Box>
          </Airtable.Box>

          <Airtable.Box backgroundColor="rgb(var(--ndaify-bg))" position="fixed" bottom="0" left="0" width="100%" padding="0 2pc" display="flex" justifyContent="flex-end" alignItems="center" height="80px" borderTop="thick">
            <Pager numPages={2} activeIndex={0} />
            <Airtable.Button
              onClick={onGetStartedClick}
              variant="default"
              size="large"
              style={{ backgroundColor: 'var(--ndaify-accents-success)', color: 'var(--ndaify-button-fg)' }}
            >
              Get Started →
            </Airtable.Button>
          </Airtable.Box>
        </Airtable.Box>
      </Airtable.Box>
    </>
  );
};

export default Greeting;
