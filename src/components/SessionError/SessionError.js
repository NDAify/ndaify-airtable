import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';

import {
  Box,
  useViewport,
  Button,
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
      <Box
        position={viewport.isFullscreen ? 'absolute' : 'unset'}
        top={0}
        left={0}
        right={0}
        bottom={0}
      >
        <Box display="flex" height="100%" width="100%" flexDirection="column">
          <Box display="flex" flexDirection="column" flex="1">
            <Box padding="2pc 2pc 4pc 2pc" margin="0">
              <NDAifyHeading style={{ paddingBottom: '8px' }}>
                Invalid API Key
              </NDAifyHeading>
              <Paragraph style={{ paddingBottom: '2pc' }}>
                Your API Key is no longer valid.
                {' '}
                You must reconfigure the block before you can continue.
              </Paragraph>

            </Box>
          </Box>

          <Box padding="0 2pc" display="flex" justifyContent="flex-end" alignItems="center" height="80px" borderTop="thick">
            <Pager numPages={2} activeIndex={0} />
            <Button
              onClick={onReconfigureClick}
              variant="default"
              size="large"
            >
              Reconfigure
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default SessionError;
