import bills from '../data/bills.json';
import members from '../data/members.json';
import committees from '../data/committees.json';
import { Member, MemberDepiction } from '../types/member';
import { Committee, CommitteeMember, Meeting, Activity, Subcommittee } from '../types/committee';
import { Bill, Vote } from '../types/bill';

interface RawMember {
  bioguideId: string;
  firstName: string;
  lastName: string;
  directOrderName: string;
  invertedOrderName: string;
  honorificName: string;
  name: string;
  partyName: string;
  party: string;
  state: string;
  district?: number;
  chamber: string;
  partyHistory: Array<{
    partyAbbreviation: string;
    partyName: string;
    startYear: number;
  }>;
  depiction?: MemberDepiction;
  terms: Array<{
    congress: number;
    chamber: string;
    district: number;
    startYear: number;
    endYear?: number;
    stateCode: string;
    stateName: string;
  }>;
  sponsoredLegislation?: {
    count: number;
    url: string;
  };
  cosponsoredLegislation?: {
    count: number;
    url: string;
  };
  updateDate?: string;
  url: string;
}

interface RawBill {
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
  committees?: {
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
  votes?: {
    committee?: {
      date: string;
      committee: string;
      result: string;
      total: {
        yea: number;
        nay: number;
        present: number;
        notVoting: number;
      }
    };
    house?: {
      total: {
        yea: number;
        nay: number;
        present: number;
        notVoting: number;
      };
      byParty: {
        D: {
          yea: number;
          nay: number;
          present: number;
          notVoting: number;
        };
        R: {
          yea: number;
          nay: number;
          present: number;
          notVoting: number;
        };
      };
    };
    senate?: {
      total: {
        yea: number;
        nay: number;
        present: number;
        notVoting: number;
      };
      byParty: {
        D: {
          yea: number;
          nay: number;
          present: number;
          notVoting: number;
        };
        R: {
          yea: number;
          nay: number;
          present: number;
          notVoting: number;
        };
      };
    };
  };
}

interface RawCommittee {
  congress: number;
  chamber: string;
  committeeId: string;
  systemCode: string;
  name: string;
  type: string;
  description: string;
  url: string;
  jurisdiction: string[];
  members: Array<{
    id: string;
    role: string;
    name: string;
    state: string;
    party: string;
  }>;
  meetings: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
    location: string;
    description: string;
  }>;
  recentActivity: Array<{
    date: string;
    type: string;
    description: string;
  }>;
  subcommittees: Array<{
    name: string;
    systemCode: string;
    chair: string;
    rankingMember: string;
  }>;
}

// Mock committee data for initial state
const mockCommittees = [
  {
    congress: 119,
    chamber: "house",
    committeeId: "HSAP",
    systemCode: "hsap00",
    name: "House Committee on Appropriations",
    type: "Standing",
    description: "The House Committee on Appropriations is responsible for passing appropriation bills along with its Senate counterpart.",
    url: "https://appropriations.house.gov/",
    jurisdiction: ["Defense spending", "Federal government operations"],
    members: [
      {
        id: "M001",
        role: "Chair",
        name: "Rep. Kay Granger",
        state: "TX",
        party: "R"
      }
    ],
    meetings: [
      {
        id: "MTG001",
        title: "FY2024 Defense Appropriations Bill Markup",
        date: "2024-03-15T10:00:00Z",
        status: "scheduled",
        location: "H-140 U.S. Capitol",
        description: "Full committee markup of the FY2024 Defense Appropriations Bill"
      }
    ],
    recentActivity: [
      {
        date: "2024-03-10",
        type: "hearing",
        description: "Hearing on Department of Defense Budget Request"
      }
    ],
    subcommittees: [
      {
        name: "Defense",
        systemCode: "hsap01",
        chair: "Ken Calvert",
        rankingMember: "Betty McCollum"
      }
    ]
  }
];

/**
 * Transforms raw member data into the expected Member interface format
 */
function transformMember(rawMember: RawMember): Member {
  // Find the most recent term (highest congress number)
  let mostRecentTerm = undefined;
  if (Array.isArray(rawMember.terms) && rawMember.terms.length > 0) {
    mostRecentTerm = rawMember.terms.reduce((a, b) => (a.congress > b.congress ? a : b));
  }
  return {
    id: rawMember.bioguideId,
    bioguideId: rawMember.bioguideId,
    firstName: rawMember.firstName,
    lastName: rawMember.lastName,
    fullName: rawMember.directOrderName,
    state: rawMember.state,
    stateCode: mostRecentTerm?.stateCode,
    stateName: mostRecentTerm?.stateName,
    district: rawMember.district?.toString(),
    party: rawMember.party,
    chamber: rawMember.chamber.toLowerCase().includes('house') ? 'house' : 'senate',
    committees: [], // We'll need to get this from a different source
    contactInfo: undefined,
    reelectionDate: undefined,
    photoUrl: rawMember.depiction?.imageUrl,
    votingRecord: undefined,
    depiction: rawMember.depiction,
    createdAt: undefined,
    updatedAt: rawMember.updateDate
  };
}

/**
 * Transforms raw committee data into the expected Committee interface format
 */
function transformCommittee(rawCommittee: RawCommittee): Committee {
  return {
    congress: rawCommittee.congress,
    chamber: rawCommittee.chamber as 'house' | 'senate',
    committeeId: rawCommittee.committeeId,
    systemCode: rawCommittee.systemCode,
    name: rawCommittee.name,
    type: rawCommittee.type as Committee['type'],
    description: rawCommittee.description || '',
    url: rawCommittee.url || '',
    jurisdiction: rawCommittee.jurisdiction || [],
    members: (rawCommittee.members || []).map((member): CommitteeMember => ({
      id: member.id,
      role: member.role || '',
      name: member.name,
      state: member.state,
      party: member.party as 'D' | 'R' | 'I'
    })),
    meetings: (rawCommittee.meetings || []).map((meeting): Meeting => ({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      status: meeting.status as Meeting['status'],
      location: meeting.location,
      description: meeting.description
    })),
    recentActivity: (rawCommittee.recentActivity || []).map((activity): Activity => ({
      date: activity.date,
      type: activity.type as Activity['type'],
      description: activity.description
    })),
    subcommittees: (rawCommittee.subcommittees || []).map((subcommittee): Subcommittee => ({
      name: subcommittee.name,
      systemCode: subcommittee.systemCode,
      chair: subcommittee.chair,
      rankingMember: subcommittee.rankingMember
    }))
  };
}

/**
 * staticDataService provides helper methods to access and filter static mock data
 * for bills, members, committees, and votes. All methods are synchronous and
 * operate on local JSON files. This is useful for development and UI prototyping.
 */
export const staticDataService = {
  /**
   * Get all bills.
   * @returns {Array} Array of all bills
   */
  getBills() {
    return bills as RawBill[];
  },

  /**
   * Get a bill by its congress, type, and number.
   * @param {string} billId - Bill ID in the format "HR1234" or "S1234"
   * @returns {RawBill|null} Bill object or null if not found
   */
  getBillById(billId: string): RawBill | null {
    const type = billId.substring(0, 2);
    const number = billId.substring(2);
    return (bills as RawBill[]).find(bill => 
      bill.billType === type && 
      bill.billNumber === number
    ) || null;
  },

  /**
   * Get all bills sponsored by a specific member.
   * @param {string} id - Sponsor's bioguideId
   * @returns {Array} Array of bills
   */
  getBillsBySponsor(id: string) {
    return (bills as RawBill[]).filter(bill => bill.sponsor && bill.sponsor.bioguideId === id);
  },

  /**
   * Get all bills with a specific status (e.g., 'ENACTED:SIGNED').
   * @param {string} status - Bill status text to match in latestAction
   * @returns {Array<RawBill>} Array of bills
   */
  getBillsByStatus(status: string): RawBill[] {
    return (bills as RawBill[]).filter(bill => 
      bill.latestAction && bill.latestAction.text.includes(status)
    );
  },

  /**
   * Get all bills referred to a specific committee by committeeId.
   * @param {string} committeeId - Committee ID
   * @returns {Array} Array of bills
   */
  getBillsByCommittee(committeeId: string) {
    return (bills as RawBill[]).filter(bill => bill.latestAction && bill.latestAction.text && bill.latestAction.text.includes(committeeId));
  },

  /**
   * Get all members.
   * @returns {Array<Member>} Array of all members
   */
  getMembers(): Member[] {
    return (members as unknown as RawMember[]).map(transformMember);
  },

  /**
   * Get a member by their id.
   * @param {string} id - Member's id
   * @returns {Member|null} Member object or null if not found
   */
  getMemberById(id: string): Member | null {
    const member = (members as unknown as RawMember[]).find(member => member.bioguideId === id);
    return member ? transformMember(member) : null;
  },

  /**
   * Get all members from a specific state.
   * @param {string} state - State abbreviation (e.g., 'CA')
   * @returns {Array<Member>} Array of members
   */
  getMembersByState(state: string): Member[] {
    return (members as unknown as RawMember[])
      .filter(member =>
        member.state === state ||
        (Array.isArray(member.terms) && member.terms.some(term => term.stateCode === state || term.stateName === state))
      )
      .map(transformMember);
  },

  /**
   * Get all members in a specific chamber ('house' or 'senate').
   * @param {string} chamber - Chamber name
   * @returns {Array<Member>} Array of members
   */
  getMembersByChamber(chamber: string): Member[] {
    return (members as unknown as RawMember[])
      .filter(member => member.chamber.toLowerCase().includes(chamber.toLowerCase()))
      .map(transformMember);
  },

  /**
   * Get all members of a specific party ('D', 'R', etc.).
   * @param {string} party - Party abbreviation
   * @returns {Array<Member>} Array of members
   */
  getMembersByParty(party: string): Member[] {
    return (members as unknown as RawMember[])
      .filter(member => member.party === party)
      .map(transformMember);
  },

  /**
   * Get all members serving on a specific committee.
   * @param {string} committeeId - Committee ID
   * @returns {Array<Member>} Array of members
   */
  getMembersByCommittee(committeeId: string): Member[] {
    // For now, return an empty array since we don't have committee assignments in the raw data
    return [];
  },

  /**
   * Get all committees.
   * @returns {Array<Committee>} Array of all committees
   */
  getCommittees(): Committee[] {
    // Use mock data if no committees data exists
    const committeeData = (committees || []).length > 0 ? committees : mockCommittees;
    return (committeeData as unknown as RawCommittee[]).map(transformCommittee);
  },

  /**
   * Get a committee by its committeeId.
   * @param {string} committeeId - Committee ID
   * @returns {Committee|null} Committee object or null if not found
   */
  getCommitteeById(committeeId: string): Committee | null {
    const committeeData = committees.length > 0 ? committees : mockCommittees;
    const committee = (committeeData as unknown as RawCommittee[])
      .find(committee => committee.committeeId === committeeId);
    return committee ? transformCommittee(committee) : null;
  },

  /**
   * Get all committees in a specific chamber ('house' or 'senate').
   * @param {string} chamber - Chamber name
   * @returns {Array<Committee>} Array of committees
   */
  getCommitteesByChamber(chamber: string): Committee[] {
    const committeeData = committees.length > 0 ? committees : mockCommittees;
    return (committeeData as unknown as RawCommittee[])
      .filter(committee => committee.chamber === chamber)
      .map(transformCommittee);
  },

  /**
   * Get votes for a specific bill
   * @param {string} billId - Bill ID in the format "HR1234" or "S1234"
   * @returns {Vote|null} Vote object or null if not found
   */
  getVotesByBill(billId: string): Vote | null {
    const bill = this.getBillById(billId);
    return bill?.votes || null;
  },

  /**
   * Get voting record for a member
   */
  getMemberVotingRecord(memberId: string): Array<{billId: string; vote: string}> {
    // For MVP, we'll return an empty array as voting records will be added later
    return [];
  }
}; 