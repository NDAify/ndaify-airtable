import React from 'react';

import NdaifyService from '../services/NdaifyService';

import HomeImpl from '../components/Home/Home';

import useSessionQuery from '../queries/useSessionQuery';
import useNdasQuery from '../queries/useNdasQuery';
import useNdaTemplateOptionsQuery from '../queries/useNdaTemplateOptionsQuery';

const TEN_SECONDS_IN_MILLISECONDS = 10 * 1000;

const Home = (props) => {
  const [, user] = useSessionQuery({
    initialData: props.user,
  });
  const [, ndas] = useNdasQuery({
    initialData: props.ndas,
    refetchInterval: TEN_SECONDS_IN_MILLISECONDS,
  });
  const [, ndaTemplateOptions] = useNdaTemplateOptionsQuery({
    initialData: props.ndaTemplateOptions,
  });

  return (
    <HomeImpl
      user={user}
      ndas={ndas}
      ndaTemplateOptions={ndaTemplateOptions}
    />
  );
};

Home.getInitialProps = async () => {
  const ndaifyService = new NdaifyService();

  const [
    { user },
    { ndas },
    { ndaTemplateOptions },
  ] = await Promise.all([
    NdaifyService.withCache(
      ['session'],
      (queryKey, data) => ({ user: data }),
      () => ndaifyService.getSession(),
    ),
    NdaifyService.withCache(
      ['ndas'],
      (queryKey, data) => ({ ndas: data }),
      () => ndaifyService.getNdas(),
    ),
    NdaifyService.withCache(
      ['ndasTemplateOptions'],
      (queryKey, data) => ({ ndaTemplateOptions: data }),
      () => ndaifyService.getNdaTemplateOptions(),
    ),
  ]);

  return {
    user,
    ndas,
    ndaTemplateOptions,
  };
};

export default Home;
