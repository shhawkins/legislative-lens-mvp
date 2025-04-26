export const getVoteColor = (vote: 'yes' | 'no'): string => {
  return vote === 'yes' ? 'blue.300' : 'red.300';
};

export const getStateVoteColor = (state: string, votes: { state: string; vote: 'yes' | 'no' }[]): string => {
  const stateVote = votes.find(v => v.state === state);
  return stateVote ? getVoteColor(stateVote.vote) : 'gray.300';
}; 