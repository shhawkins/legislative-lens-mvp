import { BaseEntity, WithTimestamps, Party } from './common';

export interface MemberVotingRecord {
  billId: string;
  vote: 'yes' | 'no';
}

export interface MemberDepiction {
  attribution: string;
  imageUrl: string;
}

export interface Member extends BaseEntity, WithTimestamps {
  bioguideId: string;
  name: string;
  state: string;
  district?: string;
  party: Party;
  photoUrl: string;
  committees: string[];
  votingRecord: MemberVotingRecord[];
  contactInfo: string;
  reelectionDate: string;
  depiction?: MemberDepiction;
}

export interface StateMembers {
  senators: Member[];
  representatives: Member[];
}

export interface MemberSearchParams {
  query?: string;
  state?: string;
  party?: Party;
  chamber?: 'house' | 'senate';
  committee?: string;
  page?: number;
  pageSize?: number;
} 