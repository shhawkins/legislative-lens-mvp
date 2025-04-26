/**
 * Common types used across the Legislative Lens application
 */

export interface BaseEntity {
  id: string;
}

export interface WithTimestamps {
  createdAt?: string;
  updatedAt?: string;
}

export type Party = 'D' | 'R';
export type Chamber = 'house' | 'senate';
export type VoteType = 'yea' | 'nay' | 'present' | 'not voting';
export type BillStatus = 'introduced' | 'committee' | 'floor' | 'passed' | 'failed' | 'vetoed' | 'law' | 'In Committee';
export type TimelineEventStatus = 'pending' | 'completed' | 'cancelled';
export type TimelineEventType = 'introduced' | 'committee' | 'floor' | 'president';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ErrorResponse {
  message: string;
  code: string;
  status: number;
} 