import React from 'react';
import styled from 'styled-components';

import {
  Box,
  useViewport,
} from '@airtable/blocks/ui';

import SettingsButton from '../SettingsButton/SettingButton';

import NdaifyService from '../../services/NDAifyService';

const NDAifyHeading = styled.div`
    margin: 0; 
    padding: 0; 
    color: #FFFFFF; 
    font-size: 32px;
    font-weight: 200;
`;

const getFullNameFromUser = (user) => `${user.metadata.linkedInProfile.firstName} ${user.metadata.linkedInProfile.lastName}`;

const Home = ({ user }) => {
  const viewport = useViewport();

  return (
    <>
      <SettingsButton show />
      <Box
        position={viewport.isFullscreen ? 'absolute' : 'unset'}
        top={0}
        left={0}
        right={0}
        bottom={0}
      >
        <Box display="flex" height="100vh" flexDirection="column">
          <Box display="flex" flexDirection="column" flex="1" textColor="#FFFFFF">
            <Box padding="2pc 2pc 4pc 2pc" margin="0">
              <NDAifyHeading style={{ paddingBottom: '8px' }}>
                {getFullNameFromUser(user)}
              </NDAifyHeading>
              <NDAifyHeading style={{ paddingBottom: '8px' }}>
                Send an NDA in a couple minutes.
              </NDAifyHeading>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

Home.getInitialProps = async () => {
  const ndaifyService = new NdaifyService();

  const { user } = await ndaifyService.getSession();

  return {
    user,
  };
};

export default Home;
