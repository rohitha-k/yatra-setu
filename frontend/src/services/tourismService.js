import { MOCK_DESTINATIONS } from '../data/mockData';

export const getGovernmentCircuits = () => {
  return MOCK_DESTINATIONS.filter(d => d.isGovernmentPromoted);
};

export const getLesserKnownHiddenGems = () => {
  return MOCK_DESTINATIONS.filter(d => !d.isGovernmentPromoted);
};
