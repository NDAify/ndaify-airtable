import React from 'react';
import { globalConfig } from '@airtable/blocks';

import NdaifyService from '../services/NDAifyService';

import SettingsImpl from '../components/Settings/Settings';

const Settings = ({ user, activeNDAifyApiKey }) => (
  <SettingsImpl user={user} activeNDAifyApiKey={activeNDAifyApiKey} />
);

Settings.getInitialProps = async () => {
  const ndaifyService = new NdaifyService();

  const { user } = await ndaifyService.getSession();

  return {
    user,
    activeNDAifyApiKey: globalConfig.get('NDAIFY_API_KEY'),
  };
};

export default Settings;
