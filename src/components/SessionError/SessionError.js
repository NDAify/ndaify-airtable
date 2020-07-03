import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';

import * as Airtable from '@airtable/blocks/ui';
import {
  useViewport,
} from '@airtable/blocks/ui';

import SettingsButton from '../SettingsButton/SettingButton';
import useStateRouter from '../../lib/useStateRouter';
import Pager from '../Pager/Pager';

const NDAifyHeading = styled.div`
  margin: 0; 
  padding: 0; 
  color: var(--ndaify-fg); 
  font-size: 32px;
  font-weight: 200;
`;

const Paragraph = styled.div`
  color: var(--ndaify-accents-6);
  margin: 0;
  padding: 0;
  font-size: 20px;
  font-weight: 400;
  line-height: 28px;
`;

const SessionError = () => {
  const [, setBlockState] = useStateRouter();

  const viewport = useViewport();

  const handleReconfigureClick = async () => {
    setBlockState({
      route: 'wizard',
    });
  };
  const onReconfigureClick = useCallback(handleReconfigureClick, [viewport]);

  useEffect(() => {
    viewport.enterFullscreenIfPossible();
  }, [viewport]);

  return (
    <>
      <SettingsButton show={false} />
      <Airtable.Box>
        <Airtable.Box height="calc(100vh - 80px)" overflow="scroll" display="flex" flexDirection="column" marginBottom="80px">
          <Airtable.Box padding="2pc 2pc 4pc 2pc" margin="0">
            <NDAifyHeading style={{ paddingBottom: '8px' }}>
              Invalid API Key
            </NDAifyHeading>
            <Paragraph style={{ paddingBottom: '2pc' }}>
              Your API Key is no longer valid.
              {' '}
              You must reconfigure the block before you can continue.
            </Paragraph>

          </Airtable.Box>
        </Airtable.Box>

        <Airtable.Box backgroundColor="rgb(var(--ndaify-bg))" position="fixed" bottom="0" left="0" width="100%" padding="0 2pc" display="flex" justifyContent="flex-end" alignItems="center" height="80px" borderTop="thick">
          <Pager numPages={2} activeIndex={0} />
          <Airtable.Button
            onClick={onReconfigureClick}
            variant="default"
            size="large"
          >
            Reconfigure
          </Airtable.Button>
        </Airtable.Box>
      </Airtable.Box>
    </>
  );
};

export default SessionError;
