import { BaseEntity, WithTimestamps } from './common';
import { Member } from './member';

export interface State extends BaseEntity, WithTimestamps {
  name: string;
  abbreviation: string;
  population: number;
  districts: number;
  senators: Member[];
  representatives: Member[];
  lastElection: string;
  nextElection: string;
  governor: string;
  legislature: {
    house: {
      party: string;
      seats: number;
    };
    senate: {
      party: string;
      seats: number;
    };
  };
}

export interface StateVoteData {
  state: string;
  vote: 'yes' | 'no';
  count: number;
}

export interface StateSearchParams {
  query?: string;
  region?: string;
  populationMin?: number;
  populationMax?: number;
  page?: number;
  pageSize?: number;
} 