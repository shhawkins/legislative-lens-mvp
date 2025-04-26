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

export interface Bill extends BaseEntity, WithTimestamps {
  congress: number;
  number: string;
  title: string;
  shortTitle?: string;
  sponsor: string;
  sponsors: string[];
  status: BillStatus;
  summary: string;
  text: string;
  committees: string[];
  timeline: BillTimelineEvent[];
  votes: BillVote[];
  textVersions: BillTextVersion[];
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