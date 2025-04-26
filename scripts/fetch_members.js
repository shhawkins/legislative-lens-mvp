const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_KEY = 'J4N7j25etRGL0VI3fRq9Jr6hwtCx3YaegSUcsTUP';
const BASE_URL = 'https://api.congress.gov/v3';
const OUTPUT_PATH = path.join(__dirname, '../src/data/members.json');
const CONGRESS = 119;
const PAGE_SIZE = 100;
const EXPECTED_TOTAL = 535;

async function fetchAllMemberSummaries() {
  let offset = 0;
  let summaries = [];
  let retryCount = 0;
  const MAX_RETRIES = 3;
  let hasMore = true;

  while (hasMore) {
    try {
      const url = `${BASE_URL}/member?congress=${CONGRESS}&limit=${PAGE_SIZE}&offset=${offset}&api_key=${API_KEY}`;
      console.log(`[INFO] Fetching member summaries: ${url}`);
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch member summaries: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (!data.members || !Array.isArray(data.members)) {
        throw new Error('Invalid response format: members array missing');
      }
      
      const newMembers = data.members;
      if (newMembers.length === 0) {
        hasMore = false;
        break;
      }
      
      summaries = summaries.concat(newMembers);
      console.log(`[INFO] Fetched ${summaries.length} member summaries so far (last batch: ${newMembers.length})`);
      
      offset += PAGE_SIZE;
      retryCount = 0; // Reset retry count on successful fetch
      
      // If we've reached the expected total, stop fetching
      if (summaries.length >= EXPECTED_TOTAL) {
        hasMore = false;
      }
    } catch (error) {
      console.error(`[ERROR] Attempt ${retryCount + 1}/${MAX_RETRIES} failed:`, error.message);
      retryCount++;
      
      if (retryCount >= MAX_RETRIES) {
        throw new Error(`Failed to fetch member summaries after ${MAX_RETRIES} attempts`);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }

  // Verify we have the expected number of members
  if (summaries.length !== EXPECTED_TOTAL) {
    console.warn(`[WARN] Expected ${EXPECTED_TOTAL} members but got ${summaries.length}`);
    
    // Filter out any duplicate members based on bioguideId
    const uniqueMembers = summaries.reduce((acc, member) => {
      if (!acc.find(m => m.bioguideId === member.bioguideId)) {
        acc.push(member);
      }
      return acc;
    }, []);
    
    if (uniqueMembers.length !== summaries.length) {
      console.log(`[INFO] Removed ${summaries.length - uniqueMembers.length} duplicate members`);
      summaries = uniqueMembers;
    }
  }

  return { summaries, total: summaries.length };
}

async function fetchMemberDetails(bioguideId) {
  const url = `${BASE_URL}/member/${bioguideId}?api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`[WARN] Failed to fetch details for ${bioguideId}: ${res.status}`);
    return null;
  }
  const data = await res.json();
  return data.member || null;
}

function mergeMemberData(summary, details) {
  // Merge all relevant fields from both summary and details
  return {
    bioguideId: summary.bioguideId || details.bioguideId,
    firstName: details.firstName || '',
    lastName: details.lastName || '',
    directOrderName: details.directOrderName || '',
    invertedOrderName: details.invertedOrderName || '',
    honorificName: details.honorificName || '',
    name: summary.name || details.directOrderName || '',
    partyName: summary.partyName || (details.partyHistory && details.partyHistory[0]?.partyName) || '',
    party: (details.partyHistory && details.partyHistory[0]?.partyAbbreviation) || '',
    partyHistory: details.partyHistory || [],
    state: summary.state || details.state,
    district: summary.district || details.district || null,
    chamber: (details.terms && details.terms.length > 0) ? details.terms[details.terms.length-1].chamber : (summary.terms && summary.terms.item && summary.terms.item[0]?.chamber) || '',
    depiction: summary.depiction || details.depiction || {},
    imageUrl: (summary.depiction && summary.depiction.imageUrl) || (details.depiction && details.depiction.imageUrl) || '',
    imageAttribution: (summary.depiction && summary.depiction.attribution) || (details.depiction && details.depiction.attribution) || '',
    birthYear: details.birthYear || '',
    leadership: details.leadership || [],
    terms: details.terms || (summary.terms && summary.terms.item) || [],
    sponsoredLegislation: details.sponsoredLegislation || {},
    cosponsoredLegislation: details.cosponsoredLegislation || {},
    updateDate: summary.updateDate || details.updateDate || '',
    url: summary.url || (details.url || ''),
  };
}

(async () => {
  try {
    console.log(`[START] Fetching all member summaries for the ${CONGRESS}th Congress...`);
    const { summaries, total } = await fetchAllMemberSummaries();
    console.log(`[INFO] Finished fetching all member summaries: ${summaries.length}/${total}`);
    const members = [];
    let count = 0;
    for (const summary of summaries) {
      const bioguideId = summary.bioguideId;
      const details = await fetchMemberDetails(bioguideId);
      if (details) {
        const merged = mergeMemberData(summary, details);
        members.push(merged);
      }
      count++;
      if (count % 10 === 0 || count === summaries.length) {
        console.log(`[INFO] Processed ${count}/${summaries.length} member details`);
      }
    }
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(members, null, 2));
    console.log(`[SUCCESS] Wrote ${members.length} members to ${OUTPUT_PATH}`);
    if (members.length !== EXPECTED_TOTAL) {
      console.warn(`[WARN] Expected ${EXPECTED_TOTAL} members, but got ${members.length}. There may be vacancies or API changes.`);
    } else {
      console.log(`[INFO] All ${EXPECTED_TOTAL} members loaded successfully!`);
    }
  } catch (err) {
    console.error('[ERROR]', err);
    process.exit(1);
  }
})(); 