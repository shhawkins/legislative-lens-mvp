import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Grid,
  Divider,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Skeleton,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Stack,
  Icon,
  Container,
  InputGroup,
  InputRightElement,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  Center,
  Select,
  HStack,
  Badge,
  Link,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { debounce } from 'lodash';
import { ViewIcon, AddIcon, SearchIcon, HamburgerIcon, InfoIcon, SettingsIcon, QuestionIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps";
import { scaleQuantile } from "d3-scale";
import { getVoteColor } from './utils/voteUtils';

// Import components from new structure
import StateMembersModal from './components/member/StateMembersModal';
import { Bill, Vote } from './types/bill';
import { Member } from './types/member';
import { Committee } from './types/committee';
import theme from './theme';
import ApiTest from './components/test/ApiTest';
import BillList from './components/bill/BillList';
import { staticDataService } from './services/staticDataService';
import BillSummary from './components/bill/BillSummary';
import { AppContext } from './context/AppContext';

// Mock data
const mockBill: Bill = {
  congress: 118,
  billType: 'HR',
  billNumber: '1234',
  title: 'Clean Energy Innovation Act of 2024',
  displayTitle: 'Clean Energy Innovation Act of 2024',
  summary: 'A bill to promote innovation in clean energy technologies and support their deployment.',
  introducedDate: '2024-03-01',
  policyArea: {
    name: 'Energy'
  },
  sponsor: {
    bioguideId: 'M001',
    district: 5,
    firstName: 'Cathy',
    fullName: 'Rep. Cathy McMorris Rodgers',
    isByRequest: 'N',
    lastName: 'McMorris Rodgers',
    party: 'R',
    state: 'WA',
    url: 'https://www.congress.gov/member/cathy-mcmorris-rodgers/M001'
  },
  committees: {
    count: 1,
    items: [{
      activities: [{
        date: '2024-03-15',
        name: 'Referred to'
      }],
      chamber: 'House',
      name: 'House Committee on Energy and Commerce',
      systemCode: 'HSIF',
      type: 'Standing',
      url: 'https://energycommerce.house.gov/'
    }]
  },
  timeline: {
    milestones: [
      {
        date: '2024-03-01',
        title: 'Introduced in House',
        description: 'Bill introduced by Rep. McMorris Rodgers',
        status: 'complete',
        details: {
          location: 'House Floor',
          actionBy: 'Rep. McMorris Rodgers'
        }
      },
      {
        date: '2024-03-15',
        title: 'Referred to Committee',
        description: 'Referred to House Committee on Energy and Commerce',
        status: 'complete',
        details: {
          committee: 'HSIF',
          location: '2123 Rayburn'
        }
      }
    ]
  },
  votes: {
    committee: {
      date: '2024-03-20',
      committee: 'HSIF',
      result: 'REPORTED',
      total: {
        yea: 32,
        nay: 24,
        present: 0,
        notVoting: 2
      }
    },
    house: {
      total: {
        yea: 220,
        nay: 210,
        present: 2,
        notVoting: 3
      },
      byParty: {
        D: {
          yea: 200,
          nay: 10,
          present: 1,
          notVoting: 1
        },
        R: {
          yea: 20,
          nay: 200,
          present: 1,
          notVoting: 2
        }
      }
    }
  },
  textVersions: {
    count: 1,
    url: 'https://www.congress.gov/bill/118th-congress/house-bill/1234/text'
  },
  latestAction: {
    actionDate: '2024-03-20',
    text: 'Passed House vote'
  },
  status: {
    current: 'IN_HOUSE',
    stage: 'PASSED',
    isActive: true,
    lastUpdated: '2024-03-20'
  }
};

const getMemberPhotoUrl = (bioguideId: string): string => {
  // Use a more reliable image source or local fallback
  return `https://bioguide.congress.gov/bioguide/photo/${bioguideId[0]}/${bioguideId}.jpg`;
};

const mockMember: Member = {
  id: 'M001',
  bioguideId: 'L000174',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  state: 'CA',
  district: '12',
  party: 'D',
  chamber: 'house',
  committees: ['Energy and Commerce'],
  photoUrl: 'https://via.placeholder.com/150',
  votingRecord: [{ billId: 'B001', vote: 'yes' }],
  contactInfo: 'john.doe@house.gov',
  reelectionDate: '2024-11-05',
  depiction: {
    attribution: 'Official Congressional Photo',
    imageUrl: 'https://via.placeholder.com/150'
  }
};

const mockStateMembers = {
  CA: {
    senators: [
      {
        id: 'S001',
        bioguideId: 'K000377',
        name: 'Sen. Alex Smith',
        state: 'CA',
        party: 'D',
        photoUrl: getMemberPhotoUrl('K000377'),
        committees: ['Judiciary', 'Finance'],
        contactInfo: 'alex.smith@senate.gov',
        reelectionDate: '2024-11-05',
        depiction: {
          attribution: 'Courtesy U.S. Senate Historical Office',
          imageUrl: getMemberPhotoUrl('K000377')
        }
      },
      {
        id: 'S002',
        name: 'Sen. Maria Garcia',
        state: 'CA',
        party: 'D',
        photoUrl: 'https://via.placeholder.com/150',
        committees: ['Energy', 'Foreign Relations'],
        contactInfo: 'maria.garcia@senate.gov',
        reelectionDate: '2026-11-05'
      }
    ],
    representatives: [
      {
        id: 'R001',
        bioguideId: 'L000174',
        name: 'Rep. John Doe',
        state: 'CA',
        district: '12',
        party: 'D',
        photoUrl: getMemberPhotoUrl('L000174'),
        committees: ['Energy and Commerce'],
        contactInfo: 'john.doe@house.gov',
        reelectionDate: '2024-11-05',
        depiction: {
          attribution: 'Courtesy U.S. Senate Historical Office',
          imageUrl: getMemberPhotoUrl('L000174')
        }
      },
      {
        id: 'R002',
        name: 'Rep. Jane Smith',
        state: 'CA',
        district: '15',
        party: 'R',
        photoUrl: 'https://via.placeholder.com/150',
        committees: ['Ways and Means'],
        contactInfo: 'jane.smith@house.gov',
        reelectionDate: '2024-11-05'
      }
    ]
  }
};

// Add this near other constants
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Add this after the mockStateMembers constant
const stateList = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' }
];

// Add this after the stateList constant
const mockZipToReps = {
  '90210': {
    state: 'CA',
    senators: [
      {
        id: 'S001',
        name: 'Sen. Alex Smith',
        state: 'CA',
        party: 'D',
        photoUrl: 'https://via.placeholder.com/150',
        committees: ['Judiciary', 'Finance'],
        contactInfo: 'alex.smith@senate.gov',
        reelectionDate: '2024-11-05'
      },
      {
        id: 'S002',
        name: 'Sen. Maria Garcia',
        state: 'CA',
        party: 'D',
        photoUrl: 'https://via.placeholder.com/150',
        committees: ['Energy', 'Foreign Relations'],
        contactInfo: 'maria.garcia@senate.gov',
        reelectionDate: '2026-11-05'
      }
    ],
    representative: {
      id: 'R001',
      name: 'Rep. John Doe',
      state: 'CA',
      district: '12',
      party: 'D',
      photoUrl: 'https://via.placeholder.com/150',
      committees: ['Energy and Commerce'],
      contactInfo: 'john.doe@house.gov',
      reelectionDate: '2024-11-05'
    }
  }
};

// Custom Hook for Responsive Layout
const useResponsiveLayout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

// Enhanced Timeline Component
const Timeline: React.FC<{ bill: Bill }> = React.memo(({ bill }) => (
  <Box position="relative" p={4}>
    {bill.timeline.milestones.map((event, index) => (
      <Flex key={index} position="relative" mb={6}>
        {/* Timeline dot and line */}
        <Box position="absolute" left={0} top={0}>
          <Box
            w="16px"
            h="16px"
            bg="blue.500"
            borderRadius="full"
            border="2px solid white"
            boxShadow="md"
          />
          {index < bill.timeline.milestones.length - 1 && (
            <Box
              position="absolute"
              left="7px"
              top="16px"
              w="2px"
              h="calc(100% + 16px)"
              bg="blue.200"
            />
          )}
        </Box>
        
        {/* Content */}
        <Box ml={8}>
          <Text
            fontSize="sm"
            color="gray.500"
            fontWeight="medium"
          >
            {event.date}
          </Text>
          <Text
            fontSize="md"
            fontWeight="semibold"
            color="gray.700"
            mt={1}
          >
            {event.title}
          </Text>
        </Box>
      </Flex>
    ))}
  </Box>
));

// Update mock committee data
const mockCommittee: Committee = {
  congress: 119,
  chamber: 'house',
  committeeId: 'HSIF',
  systemCode: 'hsif00',
  name: 'House Committee on Energy and Commerce',
  type: 'Standing',
  description: 'The Committee on Energy and Commerce has the broadest jurisdiction of any congressional authorizing committee.',
  url: 'https://energycommerce.house.gov/',
  jurisdiction: [
    'Energy policy',
    'Health care',
    'Consumer protection',
    'Environmental quality',
    'Interstate and foreign commerce'
  ],
  members: [
    {
      id: 'M001',
      role: 'Chair',
      name: 'Rep. Cathy McMorris Rodgers',
      state: 'WA',
      party: 'R'
    },
    {
      id: 'M002',
      role: 'Ranking Member',
      name: 'Rep. Frank Pallone, Jr.',
      state: 'NJ',
      party: 'D'
    }
  ],
  meetings: [
    {
      id: 'MTG001',
      title: 'Hearing on Clean Energy Innovation',
      date: '2024-03-20T14:00:00Z',
      status: 'scheduled',
      location: '2123 Rayburn House Office Building',
      description: 'Oversight hearing on clean energy technology development and deployment'
    }
  ],
  recentActivity: [
    {
      date: '2024-03-12',
      type: 'legislation',
      description: 'H.R. 1234 - Clean Energy Innovation Act Reported'
    },
    {
      date: '2024-03-08',
      type: 'hearing',
      description: 'Hearing on Grid Reliability and Cybersecurity'
    }
  ],
  subcommittees: [
    {
      name: 'Energy',
      systemCode: 'hsif01',
      chair: 'Jeff Duncan',
      rankingMember: 'Diana DeGette'
    },
    {
      name: 'Health',
      systemCode: 'hsif02',
      chair: 'Brett Guthrie',
      rankingMember: 'Anna Eshoo'
    }
  ]
};

// Update CommitteeModal component
const CommitteeModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  committee: Committee;
}> = ({ isOpen, onClose, committee }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{committee.name}</Heading>
          <Text fontSize="sm" color="gray.500">
            {committee.chamber.charAt(0).toUpperCase() + committee.chamber.slice(1)} Committee • {committee.congress}th Congress
          </Text>
          <Text fontSize="md" mt={2} color="gray.700">
            {committee.description}
          </Text>
          <Flex gap={2} mt={2}>
            <Badge colorScheme={committee.chamber === 'house' ? 'blue' : 'purple'}>
              {committee.chamber.charAt(0).toUpperCase() + committee.chamber.slice(1)}
            </Badge>
            <Badge colorScheme="gray">{committee.type}</Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Members</Tab>
              <Tab>Meetings</Tab>
              <Tab>Activity</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Panel */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="md" mb={4}>Jurisdiction</Heading>
                    <UnorderedList spacing={2}>
                      {committee.jurisdiction?.map((item, index) => (
                        <ListItem key={index}>{item}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                  
                  <Box>
                    <Heading size="md" mb={4}>Leadership</Heading>
                    <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
                      {committee.members
                        .filter(member => member.role === 'Chair' || member.role === 'Ranking Member')
                        .map((leader) => (
                          <Card key={leader.id} variant="outline">
                            <CardBody>
                              <Heading size="sm">{leader.name}</Heading>
                              <Text fontSize="sm" color="gray.600">{leader.role}</Text>
                              <Text fontSize="sm" color={leader.party === 'D' ? 'blue.500' : 'red.500'}>
                                {leader.party === 'D' ? 'Democrat' : 'Republican'} - {leader.state}
                              </Text>
                            </CardBody>
                          </Card>
                        ))}
                    </Grid>
                  </Box>

                  <Box>
                    <Heading size="md" mb={4}>Contact Information</Heading>
                    <Link href={committee.url} isExternal color="blue.500">
                      Committee Website <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Members Panel */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Committee Members */}
                  <Box>
                    <Heading size="md" mb={4}>Committee Members</Heading>
                    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                      {committee.members.map((member) => (
                        <Card key={member.id} variant="outline">
                          <CardBody>
                            <Flex gap={4}>
                              <Box>
                                <Heading size="sm">{member.name}</Heading>
                                <Text fontSize="sm" color={member.party === 'D' ? 'blue.500' : 'red.500'}>
                                  {member.party === 'D' ? 'Democrat' : 'Republican'} - {member.state}
                                </Text>
                                {member.role && (
                                  <Text fontSize="sm" color="gray.600">
                                    {member.role}
                                  </Text>
                                )}
                              </Box>
                            </Flex>
                          </CardBody>
                        </Card>
                      ))}
                    </Grid>
                  </Box>

                  {/* Subcommittees */}
                  {committee.subcommittees && committee.subcommittees.length > 0 && (
                    <Box>
                      <Heading size="md" mb={4}>Subcommittees</Heading>
                      <VStack spacing={4} align="stretch">
                        {committee.subcommittees.map((subcommittee) => (
                          <Card key={subcommittee.systemCode} variant="outline">
                            <CardHeader>
                              <Heading size="sm">{subcommittee.name}</Heading>
                            </CardHeader>
                            <CardBody>
                              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                <Box>
                                  <Text fontSize="sm" fontWeight="medium">Chair</Text>
                                  <Text fontSize="sm">{subcommittee.chair}</Text>
                                </Box>
                                <Box>
                                  <Text fontSize="sm" fontWeight="medium">Ranking Member</Text>
                                  <Text fontSize="sm">{subcommittee.rankingMember}</Text>
                                </Box>
                              </Grid>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* Meetings Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {committee.meetings?.map((meeting) => (
                    <Card key={meeting.id} variant="outline">
                      <CardBody>
                        <Flex justify="space-between" align="start">
                          <Box>
                            <Heading size="sm" mb={2}>{meeting.title}</Heading>
                            <Text fontSize="sm" color="gray.600">
                              {new Date(meeting.date).toLocaleDateString()} at {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {meeting.location}
                            </Text>
                            <Text fontSize="sm" mt={2}>
                              {meeting.description}
                            </Text>
                          </Box>
                          <Badge
                            colorScheme={
                              meeting.status === 'scheduled' ? 'blue' :
                              meeting.status === 'completed' ? 'green' : 'red'
                            }
                          >
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </Badge>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                  {(!committee.meetings || committee.meetings.length === 0) && (
                    <Text color="gray.500" textAlign="center">No upcoming meetings scheduled</Text>
                  )}
                </VStack>
              </TabPanel>

              {/* Activity Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {committee.recentActivity?.map((activity, index) => (
                    <Card key={index} variant="outline">
                      <CardBody>
                        <Flex justify="space-between" align="start">
                          <Box>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(activity.date).toLocaleDateString()}
                            </Text>
                            <Text fontSize="md" mt={1}>
                              {activity.description}
                            </Text>
                          </Box>
                          <Badge colorScheme={
                            activity.type === 'hearing' ? 'blue' :
                            activity.type === 'markup' ? 'green' :
                            activity.type === 'legislation' ? 'purple' : 'gray'
                          }>
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </Badge>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                  {(!committee.recentActivity || committee.recentActivity.length === 0) && (
                    <Text color="gray.500" textAlign="center">No recent activity</Text>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Add a custom hook for handling member photos
const useMemberPhoto = (bioguideId: string) => {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const url = getMemberPhotoUrl(bioguideId);
        const response = await fetch(url, { mode: 'no-cors' });
        if (response.ok) {
          setPhotoUrl(url);
        } else {
          setError(new Error('Photo not found'));
          setPhotoUrl('/default-member-photo.jpg'); // Use a local fallback image
        }
      } catch (err) {
        setError(err as Error);
        setPhotoUrl('/default-member-photo.jpg'); // Use a local fallback image
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoto();
  }, [bioguideId]);

  return { photoUrl, error, isLoading };
};

// Update the MemberCard component to use the new photo handling
const MemberCard: React.FC<{ member: Member }> = ({ member }) => {
  const { photoUrl, error, isLoading } = useMemberPhoto(member.bioguideId);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommitteeOpen, onOpen: onCommitteeOpen, onClose: onCommitteeClose } = useDisclosure();
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  const handleCommitteeClick = (committeeName: string) => {
    // In a real implementation, this would fetch committee data from the API
    setSelectedCommittee(mockCommittee);
    onCommitteeOpen();
  };

  return (
    <Card variant="elevated" w="100%">
      <CardHeader>
        <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
          <Box
            as="img"
            src={isLoading ? '/default-member-photo.jpg' : photoUrl}
            alt={`${member.firstName} ${member.lastName}`}
            w={{ base: '120px', md: '150px' }}
            h={{ base: '120px', md: '150px' }}
            borderRadius="full"
            objectFit="cover"
            border="3px solid"
            borderColor={member.party === 'D' ? 'blue.500' : 'red.500'}
          />
          <Box>
            <Heading size="lg">{member.fullName}</Heading>
            <Text fontSize="lg" color="gray.600">
              {member.state}{member.district ? `-${member.district}` : ''}
            </Text>
            <Text
              fontSize="md"
              color={member.party === 'D' ? 'blue.500' : 'red.500'}
              fontWeight="bold"
            >
              {member.party === 'D' ? 'Democrat' : 'Republican'}
            </Text>
          </Box>
        </Flex>
      </CardHeader>
      
      <CardBody>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
          {/* Left Column */}
          <Box>
            <Heading size="sm" mb={3}>Committee Assignments</Heading>
            <Flex direction="column" gap={2}>
              {member.committees.map((committee, index) => (
                <Box
                  key={index}
                  onClick={() => handleCommitteeClick(committee)}
                  cursor="pointer"
                  color="blue.500"
                  _hover={{ textDecoration: 'underline' }}
                >
                  • {committee}
                </Box>
              ))}
            </Flex>
            
            <Heading size="sm" mt={6} mb={3}>Contact Information</Heading>
            <Text fontSize="sm">{member.contactInfo}</Text>
          </Box>
          
          {/* Right Column */}
          <Box>
            <Heading size="sm" mb={3}>Recent Voting Record</Heading>
            <Flex direction="column" gap={2}>
              {member.votingRecord && member.votingRecord.map((record, index) => (
                <Flex key={index} justify="space-between" align="center">
                  <Text fontSize="sm" isTruncated>Bill {record.billId}</Text>
                  <Box
                    bg={record.vote === 'yes' ? 'green.100' : 'red.100'}
                    color={record.vote === 'yes' ? 'green.700' : 'red.700'}
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="sm"
                  >
                    {record.vote.toUpperCase()}
                  </Box>
                </Flex>
              ))}
            </Flex>
            
            <Box mt={6}>
              <Text fontSize="sm" color="gray.600">Next Election</Text>
              {member.reelectionDate && (
                <Text fontSize="md" fontWeight="medium">{member.reelectionDate}</Text>
              )}
            </Box>
          </Box>
        </Grid>
        
        <Button
          mt={6}
          colorScheme="blue"
          variant="outline"
          onClick={onOpen}
          w="100%"
        >
          View Full Profile
        </Button>
      </CardBody>
      
      {/* Committee Modal */}
      {selectedCommittee && (
        <CommitteeModal
          isOpen={isCommitteeOpen}
          onClose={onCommitteeClose}
          committee={selectedCommittee}
        />
      )}

      {/* Member Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Heading size="lg">{member.fullName}</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {member.state}{member.district ? `-${member.district}` : ''} • {member.party === 'D' ? 'Democrat' : 'Republican'}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 2fr' }} gap={6}>
              {/* Left Column - Member Info */}
              <Box>
                <Box
                  as="img"
                  src={isLoading ? '/default-member-photo.jpg' : photoUrl}
                  alt={`${member.firstName} ${member.lastName}`}
                  w="100%"
                  maxW="300px"
                  borderRadius="lg"
                  objectFit="cover"
                  border="3px solid"
                  borderColor={member.party === 'D' ? 'blue.500' : 'red.500'}
                />
                <Box mt={4}>
                  <Heading size="sm" mb={2}>Contact Information</Heading>
                  <Text fontSize="sm">{member.contactInfo}</Text>
                  {member.reelectionDate && (
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Next Election: {new Date(member.reelectionDate).toLocaleDateString()}
                    </Text>
                  )}
                </Box>
              </Box>

              {/* Right Column - Detailed Info */}
              <Box>
                <Tabs variant="soft-rounded" colorScheme="blue">
                  <TabList mb={4}>
                    <Tab>Committees</Tab>
                    <Tab>Voting Record</Tab>
                    <Tab>Biography</Tab>
                  </TabList>

                  <TabPanels>
                    {/* Committees Panel */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {member.committees.map((committee, index) => (
                          <Card key={index} variant="outline">
                            <CardBody>
                              <Flex justify="space-between" align="center">
                                <Text fontSize="md" fontWeight="medium">{committee}</Text>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleCommitteeClick(committee)}
                                >
                                  View Committee
                                </Button>
                              </Flex>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </TabPanel>

                    {/* Voting Record Panel */}
                    <TabPanel>
                      <VStack spacing={4} align="stretch">
                        {member.votingRecord && member.votingRecord.map((record, index) => (
                          <Card key={index} variant="outline">
                            <CardBody>
                              <Flex justify="space-between" align="center">
                                <Box>
                                  <Text fontSize="md" fontWeight="medium">Bill {record.billId}</Text>
                                  <Text fontSize="sm" color="gray.500">Vote: {record.vote.toUpperCase()}</Text>
                                </Box>
                                <Badge
                                  colorScheme={record.vote === 'yes' ? 'green' : 'red'}
                                  fontSize="sm"
                                >
                                  {record.vote.toUpperCase()}
                                </Badge>
                              </Flex>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </TabPanel>

                    {/* Biography Panel */}
                    <TabPanel>
                      <Box>
                        {member.depiction?.attribution && (
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            Photo: {member.depiction.attribution}
                          </Text>
                        )}
                        {member.depiction?.imageUrl && (
                          <Box
                            as="img"
                            src={member.depiction.imageUrl}
                            alt={`Official portrait of ${member.fullName}`}
                            w="100%"
                            maxW="400px"
                            borderRadius="lg"
                            mb={4}
                          />
                        )}
                        <Text fontSize="md">
                          {member.fullName} represents {member.state}{member.district ? `'s ${member.district}th district` : ''} in the {member.district ? 'House of Representatives' : 'Senate'}. 
                          As a {member.party === 'D' ? 'Democrat' : 'Republican'}, they serve on the following committees: {member.committees.join(', ')}.
                        </Text>
                      </Box>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Card>
  );
};

// Add this new component after the MemberCard component
const ZipCodeSearchModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  zipCode: string;
}> = ({ isOpen, onClose, zipCode }) => {
  const reps = mockZipToReps[zipCode as keyof typeof mockZipToReps];
  
  if (!reps) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>No Representatives Found</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text>No representatives found for zip code {zipCode}. Please try another zip code.</Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Your Representatives</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Senators Section */}
            <Box>
              <Heading size="md" mb={4}>U.S. Senators</Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                {reps.senators.map((senator) => (
                  <Card key={senator.id} variant="outline">
                    <CardBody>
                      <Flex gap={4}>
                        <Box
                          as="img"
                          src={senator.photoUrl}
                          alt={senator.name}
                          w="60px"
                          h="60px"
                          borderRadius="full"
                          objectFit="cover"
                        />
                        <Box>
                          <Heading size="sm">{senator.name}</Heading>
                          <Text fontSize="sm" color={senator.party === 'D' ? 'blue.500' : 'red.500'}>
                            {senator.party === 'D' ? 'Democrat' : 'Republican'}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {senator.committees.join(', ')}
                          </Text>
                        </Box>
                      </Flex>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </Box>

            {/* Representative Section */}
            <Box>
              <Heading size="md" mb={4}>U.S. Representative</Heading>
              <Card variant="outline">
                <CardBody>
                  <Flex gap={4}>
                    <Box
                      as="img"
                      src={reps.representative.photoUrl}
                      alt={reps.representative.name}
                      w="60px"
                      h="60px"
                      borderRadius="full"
                      objectFit="cover"
                    />
                    <Box>
                      <Heading size="sm">{reps.representative.name}</Heading>
                      <Text fontSize="sm" color={reps.representative.party === 'D' ? 'blue.500' : 'red.500'}>
                        {reps.representative.party === 'D' ? 'Democrat' : 'Republican'}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        District {reps.representative.district}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {reps.representative.committees.join(', ')}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const getStateVoteColor = (state: string, votes: Vote | undefined): string => {
  if (!votes || !votes.house) return 'gray.200';
  
  // For now, we'll use a simple majority rule for coloring
  // In a real app, we'd want to calculate this based on the representatives from each state
  const total = votes.house.total;
  const yeaPercentage = total.yea / (total.yea + total.nay);
  
  if (yeaPercentage > 0.5) {
    return 'blue.500';
  } else if (yeaPercentage < 0.5) {
    return 'red.500';
  }
  return 'gray.200';
};

// Update the EnhancedMap component
const EnhancedMap: React.FC<{
  bill: Bill | null;
  selectedState: string | null;
  onSelectState: (state: string) => void;
  homeState?: string;
}> = ({ bill, selectedState, onSelectState, homeState }) => {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const { isOpen: isStateModalOpen, onOpen: onStateModalOpen, onClose: onStateModalClose } = useDisclosure();
  const { isOpen: isZipModalOpen, onOpen: onZipModalOpen, onClose: onZipModalClose } = useDisclosure();
  const [zipCode, setZipCode] = useState('');
  const [position, setPosition] = useState({ coordinates: [-97, 38], zoom: 1 });

  const handleMoveEnd = useCallback((position: any) => {
    setPosition(position);
  }, []);

  const voteColors = useMemo(() => {
    const colors: Record<string, string> = {};
    stateList.forEach(state => {
      colors[state.code] = getStateVoteColor(state.code, bill?.votes);
    });
    return colors;
  }, [bill?.votes]);

  const handleStateClick = (stateCode: string) => {
    onSelectState(stateCode);
    onStateModalOpen();
  };

  const handleStateSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stateCode = event.target.value;
    if (stateCode) {
      onSelectState(stateCode);
      onStateModalOpen();
    }
  };

  const handleZipCodeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '').slice(0, 5);
    setZipCode(value);
    if (value.length === 5) {
      onZipModalOpen();
    }
  };

  return (
    <Box position="relative" width="100%" height="300px">
      {/* Search Controls */}
      <Box position="absolute" top={2} left={2} zIndex={1} bg="white" p={2} borderRadius="md" shadow="md">
        <HStack spacing={2}>
          <InputGroup size="sm" width="150px">
            <Input
              placeholder="Enter ZIP code"
              value={zipCode}
              onChange={handleZipCodeChange}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
            />
            <InputRightElement>
              <SearchIcon color="gray.500" />
            </InputRightElement>
          </InputGroup>
          <Text color="gray.500">or</Text>
          <Select
            placeholder="Select a state"
            value={selectedState || ''}
            onChange={handleStateSelect}
            size="sm"
            width="150px"
          >
            {stateList.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </Select>
        </HStack>
      </Box>

      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 900 }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates as [number, number]}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const stateCode = geo.properties.postal;
                const isSelected = selectedState === stateCode;
                const isHome = homeState === stateCode;
                const voteColor = voteColors[stateCode];

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleStateClick(stateCode)}
                    onMouseEnter={() => {
                      setTooltipContent(geo.properties.name);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    style={{
                      default: {
                        fill: voteColor || "#D6D6DA",
                        outline: "none",
                        stroke: "#FFF",
                        strokeWidth: 1,
                      },
                      hover: {
                        fill: voteColor || "#A5A5A5",
                        outline: "none",
                        stroke: "#1A365D",
                        strokeWidth: 2,
                        cursor: "pointer",
                      },
                      pressed: {
                        fill: voteColor || "#666666",
                        outline: "none",
                        stroke: "#1A365D",
                        strokeWidth: 2,
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
        <Box
          position="absolute"
          top={2}
          right={2}
          bg="white"
          px={3}
          py={2}
          borderRadius="md"
          shadow="md"
          zIndex={1}
        >
          <Text fontSize="sm" fontWeight="medium">{tooltipContent}</Text>
        </Box>
      )}

      <StateMembersModal 
        isOpen={isStateModalOpen} 
        onClose={onStateModalClose} 
        stateCode={selectedState || ''} 
        stateName={stateList.find(s => s.code === selectedState)?.name || ''}
      />
      <ZipCodeSearchModal
        isOpen={isZipModalOpen}
        onClose={onZipModalClose}
        zipCode={zipCode}
      />
    </Box>
  );
};

const PinnedBills: React.FC<{ bills: Bill[] }> = ({ bills }) => (
  <VStack spacing={4} align="stretch" w="100%">
    {bills.length > 0 ? (
      bills.map((bill) => (
        <Card key={`${bill.billType}${bill.billNumber}`} variant="outline">
          <CardBody>
            <Heading size="sm" mb={2}>{bill.title}</Heading>
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {bill.summary}
            </Text>
            <HStack mt={2} spacing={2}>
              <Badge colorScheme={bill.status.isActive ? 'green' : 'gray'}>
                {bill.status.current}
              </Badge>
              <Badge colorScheme="blue">
                {bill.committees.items[0]?.name}
              </Badge>
            </HStack>
          </CardBody>
        </Card>
      ))
    ) : (
      <Text color="gray.500" textAlign="center">No pinned bills</Text>
    )}
  </VStack>
);

// Enhanced Footer Component
const Footer: React.FC = () => {
  const { pinnedBills } = useContext(AppContext);

  return (
    <Box
      as="footer"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
      zIndex={2}
    >
      <Container maxW="container.xl" py={4}>
        <Accordion allowToggle>
          <AccordionItem border="none">
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Heading size="sm">
                  Pinned Bills ({pinnedBills.length})
                </Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <PinnedBills bills={pinnedBills} />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Container>
    </Box>
  );
};

// Enhanced Search Modal Component
const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bills' | 'members' | 'committees'>('bills');
  const [searchResults, setSearchResults] = useState<{
    bills: any[];
    members: any[];
    committees: any[];
  }>({ bills: [], members: [], committees: [] });
  const { isOpen: isCommitteeOpen, onOpen: onCommitteeOpen, onClose: onCommitteeClose } = useDisclosure();
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const { isOpen: isBillOpen, onOpen: onBillOpen, onClose: onBillClose } = useDisclosure();

  // Get total counts for tabs
  const totalBills = staticDataService.getBills().length;
  const totalMembers = staticDataService.getMembers().length;
  const totalCommittees = staticDataService.getCommittees().length;

  // Load initial data
  useEffect(() => {
    const bills = staticDataService.getBills().slice(0, 5); // Show first 5 bills
    const members = staticDataService.getMembers().slice(0, 5); // Show first 5 members
    const committees = staticDataService.getCommittees().slice(0, 5); // Show first 5 committees
    setSearchResults({ bills, members, committees });
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    const q = query.trim().toLowerCase();

    if (q === '') {
      // Show initial results if query is empty
      const bills = staticDataService.getBills().slice(0, 5);
      const members = staticDataService.getMembers().slice(0, 5);
      const committees = staticDataService.getCommittees().slice(0, 5);
      setSearchResults({ bills, members, committees });
    } else {
      // Filter based on search query
      const bills = staticDataService.getBills().filter(
        (bill: any) =>
          (bill.title && bill.title.toLowerCase().includes(q)) ||
          (bill.summary && bill.summary.toLowerCase().includes(q))
      );
      const members = staticDataService.getMembers().filter(
        (member: any) =>
          (member.firstName && member.firstName.toLowerCase().includes(q)) ||
          (member.lastName && member.lastName.toLowerCase().includes(q)) ||
          (member.fullName && member.fullName.toLowerCase().includes(q))
      );
      const committees = staticDataService.getCommittees().filter(
        (committee: any) =>
          (committee.name && committee.name.toLowerCase().includes(q)) ||
          (committee.description && committee.description.toLowerCase().includes(q))
      );
      setSearchResults({ bills, members, committees });
    }
    setIsLoading(false);
  }, []);

  const handleCommitteeClick = (committee: Committee) => {
    setSelectedCommittee(committee);
    onCommitteeOpen();
  };

  const handleBillClick = (bill: any) => {
    setSelectedBillId(`${bill.congress}-${bill.billType.toLowerCase()}-${bill.billNumber}`);
    onBillOpen();
  };

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

  const getEmptyStateMessage = (tab: 'bills' | 'members' | 'committees') => {
    if (searchQuery.trim() === '') {
      return `No recent ${tab}`;
    }
    return `No ${tab} found matching "${searchQuery}"`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Input
            placeholder="Search bills, members, or committees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="lg"
            autoFocus
          />
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Tabs variant="enclosed" onChange={(index) => setActiveTab(['bills', 'members', 'committees'][index] as any)}>
            <TabList>
              <Tab>Bills ({totalBills})</Tab>
              <Tab>Members ({totalMembers})</Tab>
              <Tab>Committees ({totalCommittees})</Tab>
            </TabList>
            <TabPanels>
              {/* Bills Panel */}
              <TabPanel>
                {isLoading ? (
                  <Stack spacing={4}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} height="60px" />
                    ))}
                  </Stack>
                ) : (
                  <Stack spacing={4}>
                    {searchResults.bills.map((bill) => (
                      <Card key={`${bill.congress}-${bill.billType}-${bill.billNumber}`} variant="outline" cursor="pointer" _hover={{ bg: 'gray.50' }} onClick={() => handleBillClick(bill)}>
                        <CardBody>
                          <Heading size="sm">{bill.title}</Heading>
                          <Box fontSize="sm" color="gray.600" noOfLines={2} dangerouslySetInnerHTML={{ __html: bill.summary }} />
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            Status: {bill.latestAction?.text || 'No status available'}
                          </Text>
                        </CardBody>
                      </Card>
                    ))}
                    {searchResults.bills.length === 0 && (
                      <Box textAlign="center" py={8}>
                        <Text color="gray.500">{getEmptyStateMessage('bills')}</Text>
                      </Box>
                    )}
                  </Stack>
                )}
              </TabPanel>

              {/* Members Panel */}
              <TabPanel>
                {isLoading ? (
                  <Stack spacing={4}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} height="80px" />
                    ))}
                  </Stack>
                ) : (
                  <Stack spacing={4}>
                    {searchResults.members.map((member) => (
                      <Card key={member.id} variant="outline" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                        <CardBody>
                          <Flex gap={4} align="center">
                            <Box
                              as="img"
                              src={member.photoUrl}
                              alt={`${member.firstName} ${member.lastName}`}
                              w="50px"
                              h="50px"
                              borderRadius="full"
                            />
                            <Box>
                              <Heading size="sm">{member.firstName} {member.lastName}</Heading>
                              <Text fontSize="sm" color="gray.600">
                                {member.state}{member.district ? `-${member.district}` : ''}
                              </Text>
                              <Text fontSize="xs" color={member.party === 'D' ? 'blue.500' : 'red.500'}>
                                {member.party === 'D' ? 'Democrat' : 'Republican'}
                              </Text>
                            </Box>
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                    {searchResults.members.length === 0 && (
                      <Box textAlign="center" py={8}>
                        <Text color="gray.500">{getEmptyStateMessage('members')}</Text>
                      </Box>
                    )}
                  </Stack>
                )}
              </TabPanel>

              {/* Committees Panel */}
              <TabPanel>
                {isLoading ? (
                  <Stack spacing={4}>
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} height="60px" />
                    ))}
                  </Stack>
                ) : (
                  <Stack spacing={4}>
                    {searchResults.committees.map((committee) => (
                      <Card key={committee.id} variant="outline" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                        <CardBody onClick={() => handleCommitteeClick(committee)}>
                          <Flex direction="column" gap={2}>
                            <Heading size="sm">{committee.name}</Heading>
                            <Text fontSize="sm" color="gray.600" noOfLines={2}>
                              {committee.description}
                            </Text>
                            <Flex gap={2} mt={1}>
                              <Badge colorScheme={committee.chamber === 'house' ? 'blue' : 'purple'}>
                                {committee.chamber.charAt(0).toUpperCase() + committee.chamber.slice(1)}
                              </Badge>
                              <Badge colorScheme="gray">{committee.type}</Badge>
                              {committee.members.length > 0 && (
                                <Badge colorScheme="green">
                                  {committee.members.length} Members
                                </Badge>
                              )}
                            </Flex>
                            {committee.recentActivity && committee.recentActivity.length > 0 && (
                              <Text fontSize="xs" color="gray.500" mt={1}>
                                Latest: {committee.recentActivity[0].description}
                              </Text>
                            )}
                          </Flex>
                        </CardBody>
                      </Card>
                    ))}
                    {searchResults.committees.length === 0 && (
                      <Box textAlign="center" py={8}>
                        <Text color="gray.500">{getEmptyStateMessage('committees')}</Text>
                      </Box>
                    )}
                  </Stack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>

      {/* Bill Summary Modal */}
      {selectedBillId && (
        <BillSummary
          billId={selectedBillId}
          isOpen={isBillOpen}
          onClose={() => {
            setSelectedBillId(null);
            onBillClose();
          }}
        />
      )}

      {/* Committee Modal */}
      {selectedCommittee && (
        <CommitteeModal
          isOpen={isCommitteeOpen}
          onClose={onCommitteeClose}
          committee={selectedCommittee}
        />
      )}
    </Modal>
  );
};

// Main App Component
const App: React.FC = () => {
  const isMobile = useResponsiveLayout();
  const [selectedBill, setSelectedBill] = useState<Bill>(mockBill);
  const [selectedMember, setSelectedMember] = useState<Member>(mockMember);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure();
  const { isOpen: isDrawerOpen, onOpen: onDrawerOpen, onClose: onDrawerClose } = useDisclosure();
  const toast = useToast();

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setSelectedMember(mockMember);
    toast({ title: `Selected ${state}`, status: 'info', duration: 2000 });
  };

  return (
    <ChakraProvider>
      <Flex direction="column" minH="100vh" bg="gray.50">
        {/* Header */}
        <Box 
          as="header" 
          position="sticky" 
          top={0} 
          zIndex={10}
          bg="blue.500" 
          color="white" 
          shadow="md"
        >
          <Container maxW="container.xl" py={4}>
            <Flex justify="space-between" align="center" wrap={{ base: 'wrap', md: 'nowrap' }} gap={4}>
              <Heading size="md">Congress Explorer</Heading>
              <InputGroup maxW={{ base: 'full', md: '400px' }}>
                <Input
                  placeholder="Search bills or members..."
                  bg="white"
                  color="black"
                  onClick={onSearchOpen}
                  _placeholder={{ color: 'gray.500' }}
                />
                <InputRightElement>
                  <Icon as={SearchIcon} color="gray.500" />
                </InputRightElement>
              </InputGroup>
              <IconButton
                display={{ base: 'flex', md: 'none' }}
                aria-label="Menu"
                icon={<HamburgerIcon />}
                onClick={onDrawerOpen}
                variant="outline"
                colorScheme="whiteAlpha"
              />
            </Flex>
          </Container>
        </Box>

        {/* API Test Component */}
        <Box p={4} bg="gray.100">
          <ApiTest />
        </Box>

        {/* Main Content */}
        <Container maxW="container.xl" flex={1} py={6}>
          {isMobile ? (
            <Accordion allowToggle defaultIndex={[0]}>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="sm">Bill Interface</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={6} align="stretch">
                    <Box bg="white" p={4} rounded="md" shadow="sm">
                      <Timeline bill={selectedBill} />
                    </Box>
                    {/* <Box bg="white" p={4} rounded="md" shadow="sm">
                      <BillSummary bill={selectedBill} />
                    </Box> */}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="sm">Member Interface</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={6} align="stretch">
                    <Box bg="white" p={4} rounded="md" shadow="sm">
                      <EnhancedMap
                        bill={selectedBill}
                        selectedState={selectedState}
                        onSelectState={handleStateSelect}
                        homeState="CA"
                      />
                    </Box>
                    <Box bg="white" p={4} rounded="md" shadow="sm">
                      <MemberCard member={selectedMember} />
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          ) : (
            <Grid
              templateColumns="1fr 2px 1fr"
              gap={6}
              bg="white"
              p={6}
              rounded="lg"
              shadow="md"
            >
              {/* Left Panel - Bill Interface */}
              <VStack spacing={6} align="stretch">
                <Box p={4} bg="gray.50" rounded="md">
                  <Timeline bill={selectedBill} />
                </Box>
                {/* <Box p={4} bg="gray.50" rounded="md">
                  <BillSummary bill={selectedBill} />
                </Box> */}
              </VStack>

              {/* Divider */}
              <Box 
                position="relative" 
                cursor="col-resize" 
                _hover={{ bg: "gray.100" }}
                onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                  const startX = e.clientX;
                  const parentElement = e.currentTarget?.parentElement as HTMLDivElement | null;
                  const leftPanel = parentElement?.firstElementChild as HTMLDivElement | null;
                  const startWidth = leftPanel?.offsetWidth || 0;
                  
                  const handleMouseMove = (e: MouseEvent) => {
                    const delta = e.clientX - startX;
                    const newWidth = Math.min(Math.max(startWidth + delta, 300), 600);
                    if (leftPanel) {
                      leftPanel.style.width = `${newWidth}px`;
                    }
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                <Divider orientation="vertical" borderColor="gray.200" />
              </Box>

              {/* Right Panel - Member Interface */}
              <VStack spacing={6} align="stretch" minW="0" flex="1">
                <Box p={4} bg="gray.50" rounded="md" minW="0" w="100%" overflow="hidden" minH="200px" maxH="600px">
                  <EnhancedMap
                    bill={selectedBill}
                    selectedState={selectedState}
                    onSelectState={handleStateSelect}
                    homeState="CA"
                  />
                </Box>

                {/* Horizontal Divider */}
                <Box 
                  position="relative" 
                  cursor="row-resize" 
                  _hover={{ bg: "gray.100" }}
                  onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                    const startY = e.clientY;
                    const parentElement = e.currentTarget?.parentElement as HTMLDivElement | null;
                    const mapBox = parentElement?.firstElementChild as HTMLDivElement | null;
                    const startHeight = mapBox?.offsetHeight || 0;
                    
                    const handleMouseMove = (e: MouseEvent) => {
                      const delta = e.clientY - startY;
                      const newHeight = Math.min(Math.max(startHeight + delta, 200), 600);
                      if (mapBox) {
                        mapBox.style.height = `${newHeight}px`;
                      }
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  <Divider borderColor="gray.200" />
                </Box>

                <Box p={4} bg="gray.50" rounded="md">
                  <MemberCard member={selectedMember} />
                </Box>
              </VStack>
            </Grid>
          )}
        </Container>

        {/* Main Content - Footer Divider */}
        <Box 
          position="relative" 
          cursor="row-resize" 
          _hover={{ bg: "gray.100" }}
          onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
            const startY = e.clientY;
            const mainContent = e.currentTarget?.previousElementSibling as HTMLDivElement | null;
            const footer = e.currentTarget?.nextElementSibling as HTMLDivElement | null;
            const startMainHeight = mainContent?.offsetHeight || 0;
            const startFooterHeight = footer?.offsetHeight || 0;
            
            const handleMouseMove = (e: MouseEvent) => {
              const delta = e.clientY - startY;
              const newMainHeight = startMainHeight + delta;
              const newFooterHeight = startFooterHeight - delta;
              if (mainContent) {
                mainContent.style.height = `${newMainHeight}px`;
              }
              if (footer) {
                footer.style.height = `${newFooterHeight}px`;
              }
            };
            
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        >
          <Divider borderColor="gray.200" />
        </Box>

        {/* Footer */}
        <Footer />

        {/* Search Modal */}
        <SearchModal isOpen={isSearchOpen} onClose={onSearchClose} />

        {/* Mobile Drawer */}
        <Drawer isOpen={isDrawerOpen} placement="right" onClose={onDrawerClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Menu</DrawerHeader>
            <DrawerBody>
              <VStack spacing={4} align="stretch">
                <Button variant="ghost" leftIcon={<InfoIcon />}>About</Button>
                <Button variant="ghost" leftIcon={<SettingsIcon />}>Settings</Button>
                <Button variant="ghost" leftIcon={<QuestionIcon />}>Help</Button>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Flex>
    </ChakraProvider>
  );
};

export default App;