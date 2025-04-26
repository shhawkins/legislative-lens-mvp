import { BaseEntity, WithTimestamps, Party, Chamber } from './common';

export interface CommitteeMember {
  id: string;
  name: string;
  party: Party;
  state: string;
  title?: string;
}

export interface Subcommittee {
  id: string;
  name: string;
  members: CommitteeMember[];
}

export interface CommitteeMeeting {
  id: string;
  date: string;
  time: string;
  title: string;
  location: string;
  description: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface CommitteeReport {
  id: string;
  title: string;
  date: string;
  reportNumber: string;
  url: string;
}

export interface Committee extends BaseEntity, WithTimestamps {
  name: string;
  chamber: Chamber;
  congress: number;
  subcommittees: Subcommittee[];
  members: CommitteeMember[];
  meetings?: CommitteeMeeting[];
  reports?: CommitteeReport[];
}

export interface CommitteeSearchParams {
  query?: string;
  chamber?: Chamber;
  congress?: number;
  page?: number;
  pageSize?: number;
} 