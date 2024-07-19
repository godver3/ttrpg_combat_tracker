import { getCombatStateByUsername } from '../lib/combatants';

export async function getServerSideProps(context) {
  console.log('Cookies:', context.req.cookies);

  const username = context.req.cookies.user ? JSON.parse(context.req.cookies.user).username : null;
  
  console.log('Username from cookies:', username);
  
  let initialCombatState = { combatants: [], currentTurn: 0, isCombatActive: false, combatTime: 0 };

  if (username) {
    try {
      console.log(`Fetching combat state for user: ${username}`);
      initialCombatState = getCombatStateByUsername(username);
      console.log('Fetched combat state:', initialCombatState);
    } catch (error) {
      console.error('Error fetching combat state:', error);
    }
  } else {
    console.log('No username found in cookies');
  }

  return {
    props: { initialCombatState },
  };
}

import Layout from '../components/Layout';

export default function Home({ initialCombatState }) {
  return <Layout initialCombatState={initialCombatState} />;
}
