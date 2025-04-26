import fs from 'fs';
import path from 'path';

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../../src/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Generate dummy bills data
const generateBills = () => {
  const bills = [
    {
      congress: 118,
      billNumber: 1,
      billType: "HR",
      title: "To amend the Internal Revenue Code of 1986 to provide tax relief for middle-class families",
      sponsor: {
        bioguideId: "S001184",
        firstName: "John",
        lastName: "Smith",
        party: "D",
        state: "CA"
      },
      introducedDate: "2023-01-03",
      latestAction: {
        actionDate: "2023-02-15",
        text: "Referred to the Committee on Ways and Means"
      },
      status: "REFERRED"
    },
    {
      congress: 118,
      billNumber: 2,
      billType: "S",
      title: "A bill to improve access to healthcare in rural areas",
      sponsor: {
        bioguideId: "J000293",
        firstName: "Jane",
        lastName: "Johnson",
        party: "R",
        state: "TX"
      },
      introducedDate: "2023-01-04",
      latestAction: {
        actionDate: "2023-03-01",
        text: "Read twice and referred to the Committee on Health, Education, Labor, and Pensions"
      },
      status: "REFERRED"
    }
  ];

  fs.writeFileSync(
    path.join(dataDir, 'bills.json'),
    JSON.stringify(bills, null, 2)
  );
  console.log('Generated bills data');
};

// Generate dummy members data
const generateMembers = () => {
  const members = [
    {
      bioguideId: "S001184",
      firstName: "John",
      lastName: "Smith",
      party: "D",
      state: "CA",
      district: "12",
      chamber: "house",
      title: "Representative",
      startDate: "2021-01-03",
      endDate: "2023-01-03"
    },
    {
      bioguideId: "J000293",
      firstName: "Jane",
      lastName: "Johnson",
      party: "R",
      state: "TX",
      district: "5",
      chamber: "senate",
      title: "Senator",
      startDate: "2019-01-03",
      endDate: "2025-01-03"
    }
  ];

  fs.writeFileSync(
    path.join(dataDir, 'members.json'),
    JSON.stringify(members, null, 2)
  );
  console.log('Generated members data');
};

// Generate dummy committees data
const generateCommittees = () => {
  const committees = [
    {
      congress: 118,
      chamber: "house",
      committeeId: "HSWM",
      name: "Committee on Ways and Means",
      subcommittees: [
        {
          subcommitteeId: "HSWM01",
          name: "Subcommittee on Health"
        }
      ]
    },
    {
      congress: 118,
      chamber: "senate",
      committeeId: "SSHR",
      name: "Committee on Health, Education, Labor, and Pensions",
      subcommittees: [
        {
          subcommitteeId: "SSHR01",
          name: "Subcommittee on Primary Health and Retirement Security"
        }
      ]
    }
  ];

  fs.writeFileSync(
    path.join(dataDir, 'committees.json'),
    JSON.stringify(committees, null, 2)
  );
  console.log('Generated committees data');
};

// Main function to generate all data
const main = async () => {
  try {
    generateBills();
    generateMembers();
    generateCommittees();
    console.log('Dummy data generation complete!');
  } catch (error) {
    console.error('Error generating dummy data:', error);
  }
};

main(); 