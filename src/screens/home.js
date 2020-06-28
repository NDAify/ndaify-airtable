import React from 'react';

import NdaifyService from '../services/NDAifyService';

import HomeImpl from '../components/Home/Home';

const Home = ({ user, ndas }) => <HomeImpl user={user} ndas={ndas} />;

Home.getInitialProps = async () => {
  const ndaifyService = new NdaifyService();

  const [
    { user },
    { ndas },
  ] = await Promise.all([
    ndaifyService.getSession(),
    ndaifyService.getNdas(),
  ]);

  return {
    user,
    ndas,
  };
};

export default Home;
