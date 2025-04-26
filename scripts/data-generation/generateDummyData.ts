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
      status: "REFERRED",
      summary: "This bill provides tax relief for middle-class families through various measures including expanded child tax credits and increased standard deductions.",
      policyArea: "Taxation"
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
      status: "REFERRED",
      summary: "This bill aims to expand healthcare access in rural communities through increased funding for rural hospitals and telehealth initiatives.",
      policyArea: "Health"
    },
    {
      congress: 118,
      billNumber: 3,
      billType: "HR",
      title: "Clean Energy Innovation and Transition Act",
      sponsor: {
        bioguideId: "G000587",
        firstName: "Sarah",
        lastName: "Green",
        party: "D",
        state: "WA"
      },
      introducedDate: "2023-01-10",
      latestAction: {
        actionDate: "2023-04-15",
        text: "Passed House, received in Senate"
      },
      status: "PASS_OVER:HOUSE",
      summary: "Comprehensive legislation to accelerate the transition to clean energy through investment in renewable technologies and grid modernization.",
      policyArea: "Energy and Environment"
    },
    {
      congress: 118,
      billNumber: 4,
      billType: "S",
      title: "Cybersecurity Infrastructure Protection Act",
      sponsor: {
        bioguideId: "R000123",
        firstName: "Robert",
        lastName: "Richards",
        party: "R",
        state: "OH"
      },
      introducedDate: "2023-02-01",
      latestAction: {
        actionDate: "2023-05-01",
        text: "Passed Senate with amendments"
      },
      status: "PASS_OVER:SENATE",
      summary: "Establishes new cybersecurity requirements for critical infrastructure and provides funding for state and local government security improvements.",
      policyArea: "Technology and Communications"
    },
    {
      congress: 118,
      billNumber: 5,
      billType: "HR",
      title: "Veterans Mental Health Support Act",
      sponsor: {
        bioguideId: "M000789",
        firstName: "Maria",
        lastName: "Martinez",
        party: "D",
        state: "NM"
      },
      introducedDate: "2023-02-15",
      latestAction: {
        actionDate: "2023-06-01",
        text: "Signed by the President. Became Public Law No: 118-23."
      },
      status: "ENACTED:SIGNED",
      summary: "Expands mental health services for veterans and provides additional funding for VA mental health facilities and programs.",
      policyArea: "Armed Forces and National Security"
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
      endDate: "2025-01-03",
      committees: ["HSWM", "HSIF"],
      leadership: "Ranking Member",
      website: "https://smith.house.gov",
      office: "2084 Rayburn House Office Building"
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
      endDate: "2025-01-03",
      committees: ["SSHR", "SSFN"],
      leadership: "Committee Chair",
      website: "https://johnson.senate.gov",
      office: "185 Dirksen Senate Office Building"
    },
    {
      bioguideId: "G000587",
      firstName: "Sarah",
      lastName: "Green",
      party: "D",
      state: "WA",
      district: "7",
      chamber: "house",
      title: "Representative",
      startDate: "2021-01-03",
      endDate: "2025-01-03",
      committees: ["HSIF", "HSST"],
      website: "https://green.house.gov",
      office: "1233 Longworth House Office Building"
    },
    {
      bioguideId: "R000123",
      firstName: "Robert",
      lastName: "Richards",
      party: "R",
      state: "OH",
      chamber: "senate",
      title: "Senator",
      startDate: "2019-01-03",
      endDate: "2025-01-03",
      committees: ["SSFN", "SSTR"],
      leadership: "Majority Whip",
      website: "https://richards.senate.gov",
      office: "522 Hart Senate Office Building"
    },
    {
      bioguideId: "M000789",
      firstName: "Maria",
      lastName: "Martinez",
      party: "D",
      state: "NM",
      district: "3",
      chamber: "house",
      title: "Representative",
      startDate: "2021-01-03",
      endDate: "2025-01-03",
      committees: ["HSVA", "HSAS"],
      website: "https://martinez.house.gov",
      office: "1419 Longworth House Office Building"
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
      url: "https://waysandmeans.house.gov",
      chair: "S001184",
      rankingMember: "J000293",
      subcommittees: [
        {
          subcommitteeId: "HSWM01",
          name: "Subcommittee on Health"
        },
        {
          subcommitteeId: "HSWM02",
          name: "Subcommittee on Tax"
        }
      ]
    },
    {
      congress: 118,
      chamber: "senate",
      committeeId: "SSHR",
      name: "Committee on Health, Education, Labor, and Pensions",
      url: "https://help.senate.gov",
      chair: "J000293",
      rankingMember: "S001184",
      subcommittees: [
        {
          subcommitteeId: "SSHR01",
          name: "Subcommittee on Primary Health and Retirement Security"
        },
        {
          subcommitteeId: "SSHR02",
          name: "Subcommittee on Children and Families"
        }
      ]
    },
    {
      congress: 118,
      chamber: "house",
      committeeId: "HSIF",
      name: "Committee on Energy and Commerce",
      url: "https://energycommerce.house.gov",
      chair: "G000587",
      rankingMember: "M000789",
      subcommittees: [
        {
          subcommitteeId: "HSIF01",
          name: "Subcommittee on Energy"
        },
        {
          subcommitteeId: "HSIF02",
          name: "Subcommittee on Health"
        }
      ]
    },
    {
      congress: 118,
      chamber: "senate",
      committeeId: "SSFN",
      name: "Committee on Finance",
      url: "https://finance.senate.gov",
      chair: "R000123",
      rankingMember: "J000293",
      subcommittees: [
        {
          subcommitteeId: "SSFN01",
          name: "Subcommittee on Taxation and IRS Oversight"
        },
        {
          subcommitteeId: "SSFN02",
          name: "Subcommittee on Health Care"
        }
      ]
    },
    {
      congress: 118,
      chamber: "house",
      committeeId: "HSVA",
      name: "Committee on Veterans' Affairs",
      url: "https://veterans.house.gov",
      chair: "M000789",
      rankingMember: "G000587",
      subcommittees: [
        {
          subcommitteeId: "HSVA01",
          name: "Subcommittee on Health"
        },
        {
          subcommitteeId: "HSVA02",
          name: "Subcommittee on Economic Opportunity"
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

// Generate dummy votes data
const generateVotes = () => {
  const votes = [
    {
      congress: 118,
      chamber: "house",
      rollCall: 100,
      date: "2023-03-15",
      question: "On Passage of H.R. 3 - Clean Energy Innovation and Transition Act",
      result: "Passed",
      billId: "hr3-118",
      totalYes: 220,
      totalNo: 210,
      totalPresent: 2,
      totalNotVoting: 3,
      voteBreakdown: {
        democratic: { yes: 215, no: 0, present: 1, notVoting: 1 },
        republican: { yes: 5, no: 210, present: 1, notVoting: 2 }
      }
    },
    {
      congress: 118,
      chamber: "senate",
      rollCall: 150,
      date: "2023-05-01",
      question: "On Passage of S. 4 - Cybersecurity Infrastructure Protection Act",
      result: "Passed",
      billId: "s4-118",
      totalYes: 68,
      totalNo: 30,
      totalPresent: 1,
      totalNotVoting: 1,
      voteBreakdown: {
        democratic: { yes: 48, no: 0, present: 0, notVoting: 0 },
        republican: { yes: 20, no: 30, present: 1, notVoting: 1 }
      }
    }
  ];

  fs.writeFileSync(
    path.join(dataDir, 'votes.json'),
    JSON.stringify(votes, null, 2)
  );
  console.log('Generated votes data');
};

// Main function to generate all data
const main = async () => {
  try {
    generateBills();
    generateMembers();
    generateCommittees();
    generateVotes();
    console.log('Dummy data generation complete!');
  } catch (error) {
    console.error('Error generating dummy data:', error);
  }
};

main(); 