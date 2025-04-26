import { BaseEntity, WithTimestamps, Party } from './common';

export interface MemberVotingRecord {
  billId: string;
  vote: 'yes' | 'no' | 'present' | 'not_voting';
}

export interface MemberDepiction {
  attribution: string;
  imageUrl: string;
}

export interface Member {
  id: string;
  bioguideId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  state: string;
  stateCode?: string;
  stateName?: string;
  district?: string;
  party: string;
  chamber: string;
  committees: string[];
  contactInfo?: string;
  reelectionDate?: string;
  photoUrl?: string;
  votingRecord?: MemberVotingRecord[];
  depiction?: MemberDepiction;
  createdAt?: string;
  updatedAt?: string;
  dateOfBirth?: string;
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

/**
 * Converts an API member to our application's Member type
 */
export function convertApiMember(apiMember: any): Member {
  return {
    id: apiMember.id || apiMember.bioguideId,
    bioguideId: apiMember.bioguideId,
    firstName: apiMember.firstName,
    lastName: apiMember.lastName,
    fullName: apiMember.fullName,
    state: apiMember.state,
    district: apiMember.district,
    party: apiMember.party,
    chamber: apiMember.chamber,
    committees: apiMember.committees || [],
    contactInfo: apiMember.contactInfo,
    reelectionDate: apiMember.reelectionDate,
    photoUrl: apiMember.photoUrl,
    votingRecord: apiMember.votingRecord,
    depiction: apiMember.depiction,
    createdAt: apiMember.createdAt,
    updatedAt: apiMember.updatedAt,
    dateOfBirth: apiMember.dateOfBirth,
  };
} 