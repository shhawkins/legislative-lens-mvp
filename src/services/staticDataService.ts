import bills from '../data/bills.json';
import members from '../data/members.json';
import committees from '../data/committees.json';
import votes from '../data/votes.json';
import { Member } from '../types/member';

/**
 * Transforms raw member data into the expected Member interface format
 */
function transformMember(rawMember: any): Member {
  // Extract committee assignments from partyHistory if available
  const committees = rawMember.partyHistory?.map((history: any) => history.committee) || [];
  
  return {
    id: rawMember.bioguideId, // Use bioguideId as the id
    bioguideId: rawMember.bioguideId,
    firstName: rawMember.firstName || '',
    lastName: rawMember.lastName || '',
    fullName: rawMember.directOrderName || `${rawMember.firstName} ${rawMember.lastName}`,
    state: rawMember.state || '',
    district: rawMember.district?.toString() || undefined,
    party: rawMember.party || '',
    chamber: rawMember.chamber || '',
    committees: committees,
    contactInfo: undefined, // Not available in raw data
    reelectionDate: undefined, // Not available in raw data
    photoUrl: rawMember.depiction?.imageUrl || undefined,
    votingRecord: undefined, // Not available in raw data
    depiction: rawMember.depiction || undefined,
    createdAt: undefined, // Not available in raw data
    updatedAt: undefined // Not available in raw data
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
    return bills;
  },

  /**
   * Get a bill by its congress, type, and number.
   * @param {number} congress - Congress number
   * @param {string} type - Bill type (e.g., 'HR', 'S')
   * @param {number} number - Bill number
   * @returns {object|null} Bill object or null if not found
   */
  getBillById(congress: number, type: string, number: number) {
    return bills.find(bill => 
      bill.congress === congress && 
      bill.billType === type && 
      bill.billNumber === number
    ) || null;
  },

  /**
   * Get all bills sponsored by a specific member.
   * @param {string} id - Sponsor's id
   * @returns {Array} Array of bills
   */
  getBillsBySponsor(id: string) {
    return bills.filter(bill => bill.sponsor && bill.sponsor.id === id);
  },

  /**
   * Get all bills with a specific status (e.g., 'ENACTED:SIGNED').
   * @param {string} status - Bill status
   * @returns {Array} Array of bills
   */
  getBillsByStatus(status: string) {
    return bills.filter(bill => bill.status === status);
  },

  /**
   * Get all bills referred to a specific committee by committeeId.
   * @param {string} committeeId - Committee ID
   * @returns {Array} Array of bills
   */
  getBillsByCommittee(committeeId: string) {
    // This assumes committeeId is referenced in bill.latestAction.text or similar
    return bills.filter(bill => bill.latestAction && bill.latestAction.text && bill.latestAction.text.includes(committeeId));
  },

  /**
   * Get all members.
   * @returns {Array} Array of all members
   */
  getMembers() {
    return members.map(transformMember);
  },

  /**
   * Get a member by their id.
   * @param {string} id - Member's id
   * @returns {object|null} Member object or null if not found
   */
  getMemberById(id: string) {
    const member = members.find(member => member.bioguideId === id);
    return member ? transformMember(member) : null;
  },

  /**
   * Get all members from a specific state.
   * @param {string} state - State abbreviation (e.g., 'CA')
   * @returns {Array} Array of members
   */
  getMembersByState(state: string) {
    return members
      .filter(member => member.state === state)
      .map(transformMember);
  },

  /**
   * Get all members in a specific chamber ('house' or 'senate').
   * @param {string} chamber - Chamber name
   * @returns {Array} Array of members
   */
  getMembersByChamber(chamber: string) {
    return members
      .filter(member => member.chamber === chamber)
      .map(transformMember);
  },

  /**
   * Get all members of a specific party ('D', 'R', etc.).
   * @param {string} party - Party abbreviation
   * @returns {Array} Array of members
   */
  getMembersByParty(party: string) {
    return members
      .filter(member => member.party === party)
      .map(transformMember);
  },

  /**
   * Get all members serving on a specific committee.
   * @param {string} committeeId - Committee ID
   * @returns {Array} Array of members
   */
  getMembersByCommittee(committeeId: string) {
    return members
      .filter(member => {
        const memberCommittees = member.partyHistory?.map((history: any) => history.committee) || [];
        return memberCommittees.includes(committeeId);
      })
      .map(transformMember);
  },

  /**
   * Get all committees.
   * @returns {Array} Array of all committees
   */
  getCommittees() {
    return committees;
  },

  /**
   * Get a committee by its committeeId.
   * @param {string} committeeId - Committee ID
   * @returns {object|null} Committee object or null if not found
   */
  getCommitteeById(committeeId: string) {
    return committees.find(committee => committee.committeeId === committeeId) || null;
  },

  /**
   * Get all committees in a specific chamber ('house' or 'senate').
   * @param {string} chamber - Chamber name
   * @returns {Array} Array of committees
   */
  getCommitteesByChamber(chamber: string) {
    return committees.filter(committee => committee.chamber === chamber);
  },

  // Votes

  /**
   * Get all votes.
   * @returns {Array} Array of all votes
   */
  getVotes() {
    return votes;
  },

  /**
   * Get all votes for a specific bill by billId.
   * @param {string} billId - Bill ID
   * @returns {Array} Array of votes
   */
  getVotesByBill(billId: string) {
    return votes.filter(vote => vote.billId === billId);
  }
}; 