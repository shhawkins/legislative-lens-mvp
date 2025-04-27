import { BaseEntity, WithTimestamps, BillStatus, TimelineEventType, TimelineEventStatus, Chamber, VoteType } from './common';

export interface BillTextVersion {
  date: string;
  type: string;
  formats: {
    type: string;
    url: string;
  }[];
  text?: string;
}

export interface TimelineEvent {
  date: string;
  title: string;
  text: string;
  description?: string;
  type?: string;
  status: 'complete' | 'pending' | 'upcoming';
  details?: {
    location?: string;
    actionBy?: string;
    committee?: string;
    outcome?: string;
    calendarNumber?: number;
    reportNumber?: string;
    type?: string;
  };
}

export interface BillTimelineEvent {
  id?: string;
  date: string;
  description?: string;
  milestone: string;
  type?: TimelineEventType;
  status?: TimelineEventStatus;
  chamber?: Chamber;
  committee?: string;
  vote?: {
    yea: number;
    nay: number;
    result: 'passed' | 'failed';
  };
}

export interface BillVote {
  id?: string;
  date?: string;
  chamber?: Chamber;
  yea?: number;
  nay?: number;
  result?: 'passed' | 'failed';
  details?: {
    memberId: string;
    vote: VoteType;
  }[];
  memberId?: string;
  state?: string;
  vote?: 'yes' | 'no';
}

export interface Vote {
  committee?: {
    date: string;
    committee: string;
    result: string;
    total: VoteCounts;
  };
  house?: {
    total: VoteCounts;
    byParty: PartyVotes;
  };
  senate?: {
    total: VoteCounts;
    byParty: PartyVotes;
  };
}

interface VoteCounts {
  yea: number;
  nay: number;
  present: number;
  notVoting: number;
}

interface PartyVotes {
  D: VoteCounts;
  R: VoteCounts;
}

export interface Bill {
  congress: number;
  billType: string;
  billNumber: string;
  title: string;
  displayTitle: string;
  summary?: string;
  introducedDate: string;
  policyArea: {
    name: string;
  };
  sponsor: {
    bioguideId: string;
    district: number;
    firstName: string;
    fullName: string;
    isByRequest: string;
    lastName: string;
    party: string;
    state: string;
    url: string;
  };
  latestAction?: {
    actionDate: string;
    text: string;
  };
  committees: {
    count: number;
    items: Array<{
      activities: Array<{
        date: string;
        name: string;
      }>;
      chamber: string;
      name: string;
      systemCode: string;
      type: string;
      url: string;
    }>;
  };
  textVersions: {
    count: number;
    url: string;
  };
  votes: Vote;
  timeline: {
    milestones: TimelineEvent[];
  };
  status: {
    current: string;
    stage: string;
    isActive: boolean;
    lastUpdated: string;
    nextAction?: string;
  };
}

export interface BillSearchParams {
  query?: string;
  status?: string;
  sponsor?: string;
  committee?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export function convertApiBill(apiBill: any): Bill {
  return {
    congress: apiBill.congress,
    billType: apiBill.billType,
    billNumber: apiBill.billNumber,
    title: apiBill.title,
    displayTitle: apiBill.displayTitle || apiBill.title,
    summary: apiBill.summary,
    introducedDate: apiBill.introducedDate,
    policyArea: apiBill.policyArea || { name: '' },
    sponsor: apiBill.sponsor,
    latestAction: apiBill.latestAction,
    committees: apiBill.committees || { count: 0, items: [] },
    textVersions: apiBill.textVersions || { count: 0, url: '' },
    votes: apiBill.votes || {},
    timeline: apiBill.timeline || { milestones: [] },
    status: apiBill.status || { current: '', stage: '', isActive: false, lastUpdated: '' }
  };
} 