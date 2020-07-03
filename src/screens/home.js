import React from 'react';

import NdaifyService from '../services/NdaifyService';

import HomeImpl from '../components/Home/Home';

import useSessionQuery from '../queries/useSessionQuery';
import useNdasQuery from '../queries/useNdasQuery';

const TEN_SECONDS_IN_MILLISECONDS = 10 * 1000;

const Home = (props) => {
  const [, user] = useSessionQuery({
    initialData: props.user,
  });
  const [, ndas] = useNdasQuery({
    initialData: props.ndas,
    refetchInterval: TEN_SECONDS_IN_MILLISECONDS,
  });

  return (
    <HomeImpl user={user} ndas={ndas} />
  );
};

Home.getInitialProps = async () => {
  const ndaifyService = new NdaifyService();

  const [
    { user },
    { ndas },
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
  ]);

  return {
    user,
    ndas,
  };
};

export default Home;
