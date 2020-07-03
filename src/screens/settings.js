import React from 'react';
import { globalConfig } from '@airtable/blocks';

import NdaifyService from '../services/NdaifyService';

import SettingsImpl from '../components/Settings/Settings';

import useSessionQuery from '../queries/useSessionQuery';

const Settings = (props) => {
  const [, user] = useSessionQuery({
    initialData: props.user,
  });

  return (
    <SettingsImpl user={user} activeNDAifyApiKey={props.activeNDAifyApiKey} />
  );
};

Settings.getInitialProps = async () => {
  const ndaifyService = new NdaifyService();

  const { user } = NdaifyService.withCache(
    ['session'],
    (queryKey, data) => ({ user: data }),
    () => ndaifyService.getSession(),
  );

  return {
    user,
    activeNDAifyApiKey: globalConfig.get('NDAIFY_API_KEY'),
  };
};

export default Settings;
