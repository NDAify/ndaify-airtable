import React from 'react';
import styled from 'styled-components';

import {
  Box,
  useViewport,
  useBase,
  useWatchable,
} from '@airtable/blocks/ui';
import { cursor } from '@airtable/blocks';

import SettingsButton from '../SettingsButton/SettingButton';

const NDAifyHeading = styled.div`
    margin: 0; 
    padding: 0; 
    color: var(--ndaify-fg); 
    font-size: 24px;
    font-weight: 200;
`;

const Home = () => {
  const viewport = useViewport();

  useWatchable(cursor, ['activeTableId', 'activeViewId']);

  const base = useBase();
  const activeTable = base.getTableByIdIfExists(cursor.activeTableId);

  // activeTable is briefly null when switching to a newly created table.
  if (!activeTable) {
    // probably display a spinner here?
    return null;
  }

  const activeView = activeTable.getViewByIdIfExists(cursor.activeViewId);

  return (
    <>
      <SettingsButton show />

      {/* <Dialog onClose={() => {}} maxWidth={400}>
        <Dialog.CloseButton />
        <Heading size="small">Can&apos;t preview URL</Heading>
        <Text variant="paragraph" marginBottom={0}>
          {activeTable.name} : {activeView.name}
        </Text>
      </Dialog> */}

      <Box
        position={viewport.isFullscreen ? 'absolute' : 'unset'}
        top={0}
        left={0}
        right={0}
        bottom={0}
      >
        <Box display="flex" height="100vh" flexDirection="column">
          <Box display="flex" flexDirection="column" flex="1">
            <Box padding="2pc 2pc 4pc 2pc" margin="0">
              <NDAifyHeading style={{ paddingBottom: '8px' }}>
                {activeTable.name}
                {' '}
                :
                {activeView.name}
              </NDAifyHeading>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Home;
