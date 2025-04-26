import { BaseEntity, WithTimestamps, Party, Chamber } from './common';

export type CommitteeType = 'Standing' | 'Select' | 'Joint' | 'Subcommittee' | 'Task Force';

export interface CommitteeMember {
  id: string;
  role?: string;
  name: string;
  state: string;
  party: 'D' | 'R' | 'I';
}

export interface Subcommittee {
  name: string;
  systemCode: string;
  chair: string;
  rankingMember: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  location: string;
  description: string;
}

export interface Activity {
  date: string;
  type: 'hearing' | 'markup' | 'legislation' | 'other';
  description: string;
}

export interface Committee {
  congress: number;
  chamber: Chamber;
  committeeId: string;
  systemCode: string;
  name: string;
  type: CommitteeType;
  description: string;
  url: string;
  jurisdiction: string[];
  members: CommitteeMember[];
  meetings: Meeting[];
  recentActivity: Activity[];
  subcommittees: Subcommittee[];
}

export interface CommitteeSearchParams {
  query?: string;
  chamber?: Chamber;
  congress?: number;
  page?: number;
  pageSize?: number;
} 