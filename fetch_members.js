const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_KEY = 'J4N7j25etRGL0VI3fRq9Jr6hwtCx3YaegSUcsTUP';
const BASE_URL = 'https://api.congress.gov/v3';
const OUTPUT_PATH = path.join(__dirname, '../src/data/members.json');
const CONGRESS = 118;
const LIMIT = 536;

async function fetchAllMemberIds() {
  let offset = 0;
  let total = 1;
  let ids = [];
  while (offset < total) {
    const url = `${BASE_URL}/member?congress=${CONGRESS}&limit=${LIMIT}&offset=${offset}&api_key=${API_KEY}`;
    console.log(`[INFO] Fetching member list: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch member list: ${res.status}`);
    const data = await res.json();
    total = data.pagination.totalCount;
    const batchIds = (data.members || []).map(m => m.bioguideId || m.memberId || m.id);
    ids = ids.concat(batchIds);
    console.log(`[INFO] Got ${batchIds.length} member IDs (offset ${offset}/${total})`);
    offset += LIMIT;
  }
  return ids;
}

async function fetchMemberDetails(id) {
  const url = `${BASE_URL}/member/${id}?api_key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`[WARN] Failed to fetch details for ${id}: ${res.status}`);
    return null;
  }
  const data = await res.json();
  const m = data.member;
  if (!m) return null;
  return {
    id: m.bioguideId || m.memberId || m.id,
    bioguideId: m.bioguideId || m.memberId || m.id,
    firstName: m.firstName,
    lastName: m.lastName,
    fullName: `${m.firstName} ${m.lastName}`.trim(),
    party: m.party,
    state: m.state,
    district: m.district || (m.chamber === 'House' ? m.district : undefined),
    chamber: m.chamber ? m.chamber.toLowerCase() : undefined,
    photoUrl: m.bioguideId ? `https://bioguide.congress.gov/bioguide/photo/${m.bioguideId[0]}/${m.bioguideId}.jpg` : '',
  };
}

(async () => {
  try {
    console.log('[START] Fetching all member IDs...');
    const ids = await fetchAllMemberIds();
    console.log(`[INFO] Fetching details for ${ids.length} members...`);
    const members = [];
    let count = 0;
    for (const id of ids) {
      const details = await fetchMemberDetails(id);
      if (details) members.push(details);
      count++;
      if (count % 25 === 0) console.log(`[INFO] Processed ${count}/${ids.length}`);
    }
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(members, null, 2));
    console.log(`[SUCCESS] Wrote ${members.length} members to ${OUTPUT_PATH}`);
  } catch (err) {
    console.error('[ERROR]', err);
    process.exit(1);
  }
})(); 