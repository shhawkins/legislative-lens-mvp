import axios, { AxiosError } from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Debug: Show current working directory and .env file path
console.log('Current working directory:', process.cwd());
console.log('Looking for .env file in:', path.join(process.cwd(), '.env'));

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Debug: Show all environment variables (except sensitive ones)
console.log('Environment variables:', Object.keys(process.env).filter(key => !key.includes('KEY')));

// Congress.gov API configuration
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
console.log('CONGRESS_API_KEY is set:', !!CONGRESS_API_KEY);
if (CONGRESS_API_KEY) {
  console.log('CONGRESS_API_KEY length:', CONGRESS_API_KEY.length);
}

const CONGRESS_API_BASE_URL = 'https://api.congress.gov/v3';

if (!CONGRESS_API_KEY) {
  console.error('Error: CONGRESS_API_KEY environment variable is not set');
  console.error('Please set your Congress.gov API key in the .env file or as an environment variable');
  process.exit(1);
}

interface CongressMember {
  id: string;
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  district?: number;
  chamber: 'house' | 'senate';
  photoUrl: string;
  committees: string[];
  sponsoredBills: string[];
  contactInfo: {
    website: string;
    phone: string;
    office: string;
  };
}

async function fetchMembers() {
  try {
    console.log('Fetching members from Congress.gov API...');
    
    // Fetch current members from Congress.gov API
    const response = await axios.get(`${CONGRESS_API_BASE_URL}/member`, {
      params: {
        api_key: CONGRESS_API_KEY,
        congress: '118', // Current Congress
        limit: 1000 // Maximum allowed
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const members = response.data.members;
    console.log(`Found ${members.length} members`);
    
    const formattedMembers: CongressMember[] = [];

    for (const member of members) {
      console.log(`Processing member: ${member.firstName} ${member.lastName}`);
      
      try {
        // Fetch detailed member info to get photo URL
        const memberDetails = await axios.get(`${CONGRESS_API_BASE_URL}/member/${member.id}`, {
          params: {
            api_key: CONGRESS_API_KEY
          },
          headers: {
            'Accept': 'application/json'
          }
        });

        const formattedMember: CongressMember = {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          party: member.party,
          state: member.state,
          district: member.district,
          chamber: member.chamber.toLowerCase() as 'house' | 'senate',
          photoUrl: memberDetails.data.member.depiction?.imageUrl || 
                   `https://bioguide.congress.gov/bioguide/photo/${member.id.charAt(0)}/${member.id}.jpg`,
          committees: member.committees?.map((c: any) => c.name) || [],
          sponsoredBills: [], // Will be populated separately
          contactInfo: {
            website: member.website || `https://${member.lastName.toLowerCase()}.${member.chamber.toLowerCase()}.gov`,
            phone: member.phone || '(202) 225-0000',
            office: member.office || `${member.chamber === 'house' ? 'Longworth' : 'Russell'} ${member.chamber === 'house' ? 'House' : 'Senate'} Office Building Room 0000`
          }
        };

        formattedMembers.push(formattedMember);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(`Error processing member ${member.id}:`, error.message);
        } else {
          console.error(`Error processing member ${member.id}: Unknown error`);
        }
        continue; // Skip this member and continue with others
      }
    }

    // Write to members.json
    const outputPath = path.join(__dirname, '../src/data/members.json');
    fs.writeFileSync(outputPath, JSON.stringify(formattedMembers, null, 2));

    console.log(`Successfully updated ${formattedMembers.length} members in members.json`);
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error instanceof Error) {
      console.error('Error fetching members:', error.message);
    } else {
      console.error('Unknown error occurred');
    }
    process.exit(1);
  }
}

// Run the script
fetchMembers(); 