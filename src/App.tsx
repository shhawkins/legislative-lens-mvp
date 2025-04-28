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
  VStack,
  Center,
  Select,
  HStack,
  Badge,
  Link,
  UnorderedList,
  ListItem,
  Image,
} from '@chakra-ui/react';
import { debounce } from 'lodash';
import { ViewIcon, AddIcon, SearchIcon, HamburgerIcon, InfoIcon, SettingsIcon, QuestionIcon, ExternalLinkIcon, RepeatIcon, StarIcon } from '@chakra-ui/icons';
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
import BillList from './components/bill/BillList';
import { staticDataService } from './services/staticDataService';
import BillSummary from './components/bill/BillSummary';
import { AppContext } from './context/AppContext';
import { convertApiBill } from './types/bill';
import BillCard from './components/bill/BillCard';
import { BsDice5 } from "react-icons/bs";

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
        text: 'Bill introduced by Rep. McMorris Rodgers',
        type: 'introduction',
        status: 'complete',
        details: {
          location: 'House Floor',
          actionBy: 'Rep. McMorris Rodgers'
        }
      },
      {
        date: '2024-03-15',
        title: 'Referred to Committee',
        text: 'Referred to House Committee on Energy and Commerce',
        type: 'committee',
        status: 'complete',
        details: {
          committee: 'HSIF',
          location: '2123 Rayburn'
        }
      }
    ]
  },
  textVersions: {
    count: 1,
    url: 'https://www.congress.gov/bill/118th-congress/house-bill/1234/text'
  },
  votes: {},
  status: {
    current: 'Referred to House Committee on Energy and Commerce',
    stage: 'Committee Consideration',
    isActive: true,
    lastUpdated: '2024-03-15'
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
      <ModalContent
        maxW={{ base: '95%', sm: '95%', md: '700px', lg: '900px', xl: '1100px' }}
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onScroll={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
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
const MemberCard: React.FC<{ member: Member; onRandom?: () => void; setSelectedBillForModal?: (bill: Bill | null) => void }> = ({ member, onRandom, setSelectedBillForModal }) => {
  // Use dummy data for all fields
  const fallbackPhotoUrl = 'https://bioguide.congress.gov/bioguide/photo/H/H001098.jpg';
  const photoUrl = member.depiction?.imageUrl || member.photoUrl || fallbackPhotoUrl;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommitteeOpen, onOpen: onCommitteeOpen, onClose: onCommitteeClose } = useDisclosure();
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  // Dummy data
  const dummyCommittees = ["Judiciary", "Finance", "Energy and Commerce"];
  const dummyContact = `${member.firstName.toLowerCase()}.${member.lastName.toLowerCase()}@mail.${member.chamber}.gov`;
  const dummyNextElection = "2026-11-03";
  const dummyVotes = [
    { billId: 'HR123', vote: 'yes', title: 'Rural Broadband Protection Act of 2025', billAbbr: 'HR123' },
    { billId: 'S456', vote: 'no', title: 'Critical Infrastructure Manufacturing Feasibility Act', billAbbr: 'S456' },
    { billId: 'HR789', vote: 'present', title: 'Foreign Adversary Communications Transparency Act', billAbbr: 'HR789' }
  ];
  const birthYear = member.birthYear || 'N/A';
  const partyLabel = member.party === 'D' ? 'Democrat' : member.party === 'R' ? 'Republican' : 'Independent';
  const partyColor = member.party === 'D' ? 'blue' : member.party === 'R' ? 'red' : 'gray';
  const chamberLabel = member.chamber ? member.chamber.charAt(0).toUpperCase() + member.chamber.slice(1) : 'N/A';

  const handleCommitteeClick = (committeeName: string) => {
    setSelectedCommittee(mockCommittee);
    onCommitteeOpen();
  };

  return (
    <Card variant="elevated" w="100%">
      <CardHeader position="relative">
        <Flex direction={{ base: 'column', md: 'row' }} gap={4} align="flex-start">
          <Box
            as="img"
            src={photoUrl}
            alt={`${member.firstName} ${member.lastName}`}
            w={{ base: '120px', md: '150px' }}
            h={{ base: '120px', md: '150px' }}
            borderRadius="full"
            objectFit="cover"
            border="3px solid"
            borderColor={partyColor + '.500'}
          />
          <Box flex={1} position="relative">
            {onRandom && (
              <IconButton
                icon={<RepeatIcon />}
                aria-label="Load random member"
                size="sm"
                variant="ghost"
                position="absolute"
                top={0}
                right={0}
                onClick={onRandom}
                zIndex={1}
              />
            )}
            <Heading size="lg" pr="40px">{member.fullName || `${member.firstName} ${member.lastName}`}</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {member.state}{member.district ? `-${member.district}` : ''} • {partyLabel} • {chamberLabel}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme={partyColor}>{partyLabel}</Badge>
              <Badge colorScheme="purple">{chamberLabel}</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500">Born: {birthYear}</Text>
            <Link 
              href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}?q=%7B%22sponsorship%22%3A%22sponsored%22%7D#search-results-wrapper`} 
              isExternal 
              color="blue.500" 
              ml={2}
              fontWeight="bold"
            >
              <ExternalLinkIcon mb="2px" mr={1} />
              View on Congress.gov
            </Link>
          </Box>
        </Flex>
      </CardHeader>
      <CardBody>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
          {/* Left Column */}
          <Box>
            <Heading size="sm" mb={3}>Committee Assignments</Heading>
            <Flex direction="column" gap={2}>
              {dummyCommittees.map((committee, index) => (
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
            <Text fontSize="sm">{dummyContact}</Text>
            <Box mt={6}>
              <Heading size="sm" mb={2}>Legislation</Heading>
              <Flex fontSize="sm" align="center" gap={1} whiteSpace="nowrap">
                Sponsored: {member.sponsoredLegislation?.count || 0}
                <Link 
                  href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}?q=%7B%22sponsorship%22%3A%22sponsored%22%7D#search-results-wrapper`} 
                  isExternal 
                  color="blue.500" 
                  ml={2}
                  fontWeight="bold"
                >
                  <ExternalLinkIcon mb="2px" mr={1} />
                  View on Congress.gov
                </Link>
              </Flex>
              <Flex fontSize="sm" align="center" gap={1} whiteSpace="nowrap">
                Co-sponsored: {member.cosponsoredLegislation?.count || 0}
                <Link 
                  href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}?q=%7B%22sponsorship%22%3A%22cosponsored%22%7D#search-results-wrapper`} 
                  isExternal 
                  color="blue.500" 
                  ml={2}
                  fontWeight="bold"
                >
                  <ExternalLinkIcon mb="2px" mr={1} />
                  View on Congress.gov
                </Link>
              </Flex>
            </Box>
          </Box>
          {/* Right Column */}
          <Box>
            <Heading size="sm" mb={3}>Recent Votes</Heading>
            <Flex direction="column" gap={2}>
              {dummyVotes.map((record, index) => (
                <Flex key={index} justify="space-between" align="center">
                  <Box
                    as="button"
                    color="blue.500"
                    fontWeight="medium"
                    bg="none"
                    border="none"
                    p={0}
                    m={0}
                    cursor="pointer"
                    textAlign="left"
                    _hover={{ textDecoration: 'underline', color: 'blue.700' }}
                    onClick={() => {
                      if (setSelectedBillForModal) {
                        const bills = staticDataService.getBills();
                        const randomBill = bills[Math.floor(Math.random() * bills.length)];
                        setSelectedBillForModal(convertApiBill(randomBill));
                      }
                    }}
                    title={record.title}
                  >
                    {record.billAbbr}
                  </Box>
                  <Box
                    bg={record.vote === 'yes' ? 'green.100' : record.vote === 'no' ? 'red.100' : 'gray.100'}
                    color={record.vote === 'yes' ? 'green.700' : record.vote === 'no' ? 'red.700' : 'gray.700'}
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
              <Text fontSize="md" fontWeight="medium">{dummyNextElection}</Text>
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
        <ModalContent
          maxW={{ base: '95%', sm: '95%', md: '700px', lg: '900px', xl: '1100px' }}
          onWheel={(e) => {
            e.stopPropagation();
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onScroll={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <ModalHeader>
            <Heading size="lg">{member.fullName || `${member.firstName} ${member.lastName}`}</Heading>
            <Text fontSize="sm" color="gray.500" mt={1}>
              {member.state}{member.district ? `-${member.district}` : ''} • {partyLabel}
            </Text>
            <Link 
              href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}?q=%7B%22sponsorship%22%3A%22sponsored%22%7D#search-results-wrapper`} 
              isExternal 
              color="blue.500" 
              ml={2}
              fontWeight="bold"
            >
              <ExternalLinkIcon mb="2px" mr={1} />
              View on Congress.gov
            </Link>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Grid templateColumns={{ base: '1fr', md: '1fr 2fr' }} gap={6}>
              {/* Left Column - Member Info */}
              <Box>
                <Box
                  as="img"
                  src={photoUrl}
                  alt={`${member.firstName} ${member.lastName}`}
                  w="100%"
                  maxW="300px"
                  borderRadius="lg"
                  objectFit="cover"
                  border="3px solid"
                  borderColor={partyColor + '.500'}
                />
                <Box mt={4}>
                  <Heading size="sm" mb={2}>Contact Information</Heading>
                  <Text fontSize="sm">{dummyContact}</Text>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Next Election: {dummyNextElection}
                  </Text>
                  {/* Sponsored/Co-sponsored Legislation */}
                  <Box mt={4}>
                    <Heading size="sm" mb={2}>Legislation</Heading>
                    <Flex fontSize="sm" align="center" gap={1} whiteSpace="nowrap">
                      Sponsored: {member.sponsoredLegislation?.count || 0}
                      <Link 
                        href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}?q=%7B%22sponsorship%22%3A%22sponsored%22%7D#search-results-wrapper`} 
                        isExternal 
                        color="blue.500" 
                        ml={2}
                        fontWeight="bold"
                      >
                        <ExternalLinkIcon mb="2px" mr={1} />
                        View on Congress.gov
                      </Link>
                    </Flex>
                    <Flex fontSize="sm" align="center" gap={1} whiteSpace="nowrap">
                      Co-sponsored: {member.cosponsoredLegislation?.count || 0}
                      <Link 
                        href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}?q=%7B%22sponsorship%22%3A%22cosponsored%22%7D#search-results-wrapper`} 
                        isExternal 
                        color="blue.500" 
                        ml={2}
                        fontWeight="bold"
                      >
                        <ExternalLinkIcon mb="2px" mr={1} />
                        View on Congress.gov
                      </Link>
                    </Flex>
                  </Box>
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
                        {dummyCommittees.map((committee, index) => (
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
                        {dummyVotes.map((record, index) => (
                          <Card key={index} variant="outline">
                            <CardBody>
                              <Flex justify="space-between" align="center">
                                <Box>
                                  <Text fontSize="md" fontWeight="medium">Bill {record.billId}</Text>
                                  <Text fontSize="sm" color="gray.500">Vote: {record.vote.toUpperCase()}</Text>
                                </Box>
                                <Badge
                                  colorScheme={record.vote === 'yes' ? 'green' : record.vote === 'no' ? 'red' : 'gray'}
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
                        <Text fontSize="md">
                          {member.fullName} represents {member.state}{member.district ? `'s ${member.district}th district` : ''} in the {member.district ? 'House of Representatives' : 'Senate'}. 
                          As a {partyLabel}, they serve on the following committees: {dummyCommittees.join(', ')}.
                        </Text>
                        <Box mt={4}>
                          <Heading size="sm" mb={2}>Legislation</Heading>
                          <Flex fontSize="sm" align="center" gap={1} whiteSpace="nowrap">
                            Sponsored: {member.sponsoredLegislation?.count || 0}
                            <Link 
                              href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}?q=%7B%22sponsorship%22%3A%22sponsored%22%7D#search-results-wrapper`} 
                              isExternal 
                              color="blue.500" 
                              ml={2}
                              fontWeight="bold"
                            >
                              <ExternalLinkIcon mb="2px" mr={1} />
                              View on Congress.gov
                            </Link>
                          </Flex>
                          <Flex fontSize="sm" align="center" gap={1} whiteSpace="nowrap">
                            Co-sponsored: {member.cosponsoredLegislation?.count || 0}
                            <Link 
                              href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}?q=%7B%22sponsorship%22%3A%22cosponsored%22%7D#search-results-wrapper`} 
                              isExternal 
                              color="blue.500" 
                              ml={2}
                              fontWeight="bold"
                            >
                              <ExternalLinkIcon mb="2px" mr={1} />
                              View on Congress.gov
                            </Link>
                          </Flex>
                        </Box>
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

// Default color scheme based on provided map
const swingRedStates = ['Nevada', 'Arizona', 'Wisconsin', 'Michigan', 'Pennsylvania', 'Georgia'];
const defaultStateColors: Record<string, string> = {
  // Solid blue
  'Washington': '#3576b8', 'Oregon': '#3576b8', 'California': '#3576b8', 'Hawaii': '#3576b8', 'Illinois': '#3576b8', 'New York': '#3576b8', 'Vermont': '#3576b8', 'Massachusetts': '#3576b8', 'Connecticut': '#3576b8', 'Rhode Island': '#3576b8', 'New Jersey': '#3576b8', 'Delaware': '#3576b8', 'Maryland': '#3576b8', 'Maine': '#3576b8', 'District of Columbia': '#3576b8', 'Colorado': '#3576b8', 'New Mexico': '#3576b8', 'Minnesota': '#3576b8', 'Virginia': '#3576b8', 'New Hampshire': '#3576b8',
  // Solid red
  'Idaho': '#e05a4e', 'Montana': '#e05a4e', 'Wyoming': '#e05a4e', 'North Dakota': '#e05a4e', 'South Dakota': '#e05a4e', 'Nebraska': '#e05a4e', 'Kansas': '#e05a4e', 'Oklahoma': '#e05a4e', 'Texas': '#e05a4e', 'Missouri': '#e05a4e', 'Arkansas': '#e05a4e', 'Louisiana': '#e05a4e', 'Mississippi': '#e05a4e', 'Alabama': '#e05a4e', 'Tennessee': '#e05a4e', 'Kentucky': '#e05a4e', 'Indiana': '#e05a4e', 'West Virginia': '#e05a4e', 'South Carolina': '#e05a4e', 'Alaska': '#e05a4e', 'Florida': '#e05a4e', 'Iowa': '#e05a4e', 'Ohio': '#e05a4e', 'North Carolina': '#e05a4e', 'Utah': '#e05a4e',
  // Swing states (will be handled with pattern)
  'Wisconsin': 'swing-red', 'Michigan': 'swing-red', 'Pennsylvania': 'swing-red', 'Nevada': 'swing-red', 'Arizona': 'swing-red', 'Georgia': 'swing-red',
};

// Update the EnhancedMap component
const EnhancedMap: React.FC<{
  bill: Bill | null;
  selectedState: string | null;
  onSelectState: (state: string) => void;
  setSelectedMember: (member: Member) => void;
  selectedMember: Member | null;
}> = ({ bill, selectedState, onSelectState, setSelectedMember, selectedMember }) => {
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const { isOpen: isStateModalOpen, onOpen: onStateModalOpen, onClose: onStateModalClose } = useDisclosure();
  const [position, setPosition] = useState({ coordinates: [-97, 38], zoom: 1 });

  const handleMoveEnd = useCallback((position: any) => {
    setPosition(position);
  }, []);

  // Color states based on static voting/member data
  const voteColors = useMemo(() => {
    const colors: Record<string, string> = {};
    stateList.forEach(state => {
      if (swingRedStates.includes(state.name)) {
        colors[state.name] = 'url(#swingRedPattern)';
      } else {
        colors[state.name] = defaultStateColors[state.name] || '#D6D6DA';
      }
    });
    return colors;
  }, [bill]);

  const handleStateClick = (stateName: string) => {
    if (!stateName) {
      console.warn('No state name provided');
      return;
    }
    const state = stateList.find(state => state.name === stateName);
    if (!state) {
      console.warn('Invalid state name:', stateName);
      return;
    }
    onSelectState(stateName);
    onStateModalOpen();
  };

  const handleStateSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const state = event.target.value;
    if (state) {
      onSelectState(state);
      onStateModalOpen();
    }
  };

  return (
    <Box
      position="relative"
      w="100%"
      aspectRatio={{ base: undefined, md: 16 / 9 }}
      maxW="1200px"
      mx="auto"
      h={{ base: 'auto', md: undefined }}
      minH={{ base: undefined, md: "400px" }}
      mt={{ base: "20px", md: "40px" }}
      overflow="visible"
    >
      {/* SVG Pattern for swing red states */}
      <svg width="0" height="0">
        <defs>
          <pattern id="swingRedPattern" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#e05a4e" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#fff" strokeWidth="2" />
          </pattern>
        </defs>
      </svg>
      {/* Search Controls */}
      <Box position="absolute" top={-10} left={0} zIndex={1} bg="white" p={2} borderRadius="md" shadow="md">
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
                const stateName = geo.properties.name;
                const isMemberState = selectedMember && selectedMember.state && stateList.find(s => s.name === stateName)?.code === selectedMember.state;
                const voteColor = voteColors[stateName];
                const isSelectedState = !selectedMember && selectedState === stateName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleStateClick(stateName)}

                    style={{
                      default: {
                        fill: voteColor || "#D6D6DA",
                        outline: "none",
                        stroke: isMemberState ? "#ffff00" : isSelectedState ? "#1A365D" : "#FFF",
                        strokeWidth: isMemberState ? 40 : isSelectedState ? 4 : 1,
                        filter: isMemberState ? "drop-shadow(0 0 4px #000)" : undefined,
                      },
                      hover: {
                        fill: voteColor || "#A5A5A5",
                        outline: "none",
                        stroke: isMemberState ? "#ffff00" : isSelectedState ? "#1A365D" : "#1A365D",
                        strokeWidth: isMemberState ? 40 : isSelectedState ? 4 : 2,
                        cursor: "pointer",
                        filter: isMemberState ? "drop-shadow(0 0 4px #000)" : undefined,
                      },
                      pressed: {
                        fill: voteColor || "#666666",
                        outline: "none",
                        stroke: isMemberState ? "#ffff00" : isSelectedState ? "#1A365D" : "#1A365D",
                        strokeWidth: isMemberState ? 40 : isSelectedState ? 4 : 2,
                        filter: isMemberState ? "drop-shadow(0 0 4px #000)" : undefined,
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>


      <StateMembersModal 
        isOpen={isStateModalOpen} 
        onClose={onStateModalClose} 
        stateCode={selectedState || ''} 
        stateName={stateList.find(s => s.code === selectedState)?.name || ''}
        onSelectMember={setSelectedMember}
      />
    </Box>
  );
};

const PinnedBills: React.FC<{ bills: Bill[]; pinnedBills: string[]; onTogglePin: (bill: Bill) => void; onViewDetails: (bill: Bill) => void }> = ({ bills, pinnedBills, onTogglePin, onViewDetails }) => (
  <VStack spacing={4} align="stretch" w="100%">
    {bills.length > 0 ? (
      bills
        .filter(bill => pinnedBills.includes(`${bill.billType.toUpperCase()}${bill.billNumber}`))
        .map((bill) => (
          <BillCard
            key={`${bill.billType}${bill.billNumber}`}
            bill={bill}
            isPinned={pinnedBills.includes(`${bill.billType.toUpperCase()}${bill.billNumber}`)}
            onTogglePin={onTogglePin}
            onViewDetails={onViewDetails}
          />
        ))
    ) : (
      <Text color="gray.500" textAlign="center">No pinned bills</Text>
    )}
  </VStack>
);

// Enhanced Footer Component
const Footer: React.FC<{ pinnedBills: string[]; handleTogglePin: (bill: Bill) => void; allBills: Bill[]; setSelectedBillForModal: (bill: Bill) => void }> = ({ pinnedBills, handleTogglePin, allBills, setSelectedBillForModal }) => {
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
      maxH={{ base: "50vh", md: "60vh" }}
      overflowY="auto"
    >
      <Container maxW="container.xl" py={3}>
        <Accordion allowToggle defaultIndex={pinnedBills.length > 0 ? [0] : []}>
          <AccordionItem border="none">
            <AccordionButton>
              <Box flex="1" textAlign="left">
                <Heading size="sm">
                  <StarIcon color="black" mr={2} />
                  Saved Bills ({pinnedBills.length})
                </Heading>
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} maxH="50vh" overflowY="auto">
              <PinnedBills bills={allBills} pinnedBills={pinnedBills} onTogglePin={handleTogglePin} onViewDetails={setSelectedBillForModal} />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Container>
    </Box>
  );
};

// Enhanced Search Modal Component
const SearchModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  setSelectedMember: (member: Member) => void; 
  setSelectedBill: (bill: Bill) => void; 
  setSelectedBillForModal: (bill: Bill) => void;
  pinnedBills: string[];
  handleTogglePin: (bill: Bill) => void;
}> = ({ isOpen, onClose, setSelectedMember, setSelectedBill, setSelectedBillForModal, pinnedBills, handleTogglePin }) => {
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

  const isBillPinned = (bill: Bill) => {
    const billId = `${bill.billType.toUpperCase()}${bill.billNumber}`;
    return pinnedBills.includes(billId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
        maxW={{ base: '95%', sm: '95%', md: '700px', lg: '900px', xl: '1100px' }}
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onScroll={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <ModalHeader pr="12">
          <Input
            placeholder="Search bills, members, or committees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="lg"
            autoFocus
          />
        </ModalHeader>
        <ModalCloseButton top="18px" right="18px" />
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
                    {searchResults.bills.map((bill) => {
                      const convertedBill = convertApiBill(bill);
                      return (
                        <BillCard 
                          key={`${bill.congress}-${bill.billType}-${bill.billNumber}`} 
                          bill={convertedBill} 
                          onViewDetails={bill => setSelectedBillForModal(bill)}
                          isPinned={isBillPinned(convertedBill)}
                          onTogglePin={handleTogglePin}
                        />
                      );
                    })}
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
                      <Card key={member.id} variant="outline" cursor="pointer" _hover={{ bg: 'gray.50' }} onClick={() => { setSelectedMember(member); onClose(); }}>
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
                      <Card key={committee.id || committee.systemCode || committee.name} variant="outline" cursor="pointer" _hover={{ bg: 'gray.50' }}>
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
          onClose={onBillClose}
          onSelectMember={member => {
            setSelectedMember(member);
            setSelectedBillId(null);
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

function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
}

// Main App Component
const App: React.FC = () => {
  const isMobile = useResponsiveLayout();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const allMembers = staticDataService.getMembers();
  const [selectedMember, setSelectedMember] = useState<Member | null>(() => {
    const randomIndex = Math.floor(Math.random() * allMembers.length);
    return allMembers[randomIndex];
  });
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const { isOpen: isSearchOpen, onOpen: onSearchOpen, onClose: onSearchClose } = useDisclosure();
  const toast = useToast();
  const [selectedBillForModal, setSelectedBillForModal] = useState<Bill | null>(null);
  const [pinnedBills, setPinnedBills] = useState<string[]>([]); // Array of bill IDs
  // Add state for controlled Accordion
  const [openSection, setOpenSection] = useState<number>(0);

  const handleTogglePin = (bill: Bill) => {
    const billId = `${bill.billType.toUpperCase()}${bill.billNumber}`;
    setPinnedBills(prev =>
      prev.includes(billId)
        ? prev.filter(id => id !== billId)
        : [...prev, billId]
    );
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    // Don't clear selectedMember here - it will be updated only when a new member is selected
    toast({ title: `Selected ${state}`, status: 'info', duration: 2000 });
  };

  const handleRandomMember = () => {
    const randomIndex = Math.floor(Math.random() * allMembers.length);
    setSelectedMember(allMembers[randomIndex]);
    toast({ title: 'Loaded random member', status: 'info', duration: 2000 });
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
              <Image 
                src="/assets/header.png" 
                alt="Legislative Lens" 
                height="40px" 
                objectFit="contain"
              />
              <IconButton
                aria-label="Search"
                icon={<SearchIcon boxSize={6} />}
                size="lg"
                colorScheme="blue"
                variant="solid"
                onClick={onSearchOpen}
              />
            </Flex>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxW="container.xl" flex={1} py={{ base: 2, md: 6 }} pb={{ base: "100px", md: pinnedBills.length > 0 ? "120px" : "80px" }}>
          {isMobile ? (
            <Accordion
              allowToggle
              index={openSection}
              onChange={idx => {
                if (typeof idx === 'number') {
                  setOpenSection(idx); // idx will be -1 if all are closed
                }
              }}
            >
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="sm">Members</Heading>
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
                        setSelectedMember={setSelectedMember}
                        selectedMember={selectedMember}
                      />
                    </Box>
                    <Box flex={1} minW={0}>
                      {selectedMember && <MemberCard member={selectedMember} onRandom={handleRandomMember} setSelectedBillForModal={setSelectedBillForModal} />}
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Heading size="sm">Recent Bills</Heading>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <VStack spacing={6} align="stretch">
                    <Box bg="white" p={4} rounded="md" shadow="sm">
                      {selectedBill ? (
                        <VStack spacing={6} align="stretch">
                          <Card variant="outline">
                            <CardBody>
                              <Heading size="md" mb={2}>{selectedBill.title}</Heading>
                              <Text fontSize="sm" color="gray.600" mb={2}>{stripHtmlTags(selectedBill.summary || "")}</Text>
                              <Text fontSize="sm" color="gray.500">Sponsored by: {selectedBill.sponsor?.fullName}</Text>
                              <Text fontSize="sm" color="gray.500">Introduced: {selectedBill.introducedDate}</Text>
                              <Text fontSize="sm" color="gray.500">Status: {selectedBill.status?.current}</Text>
                            </CardBody>
                          </Card>
                          {selectedBill.timeline && Array.isArray(selectedBill.timeline.milestones) && selectedBill.timeline.milestones.length > 0 && (
                            <Timeline bill={selectedBill} />
                          )}
                        </VStack>
                      ) : (
                        <VStack spacing={4} align="stretch">
                          <Heading size="md">Recent Bills</Heading>
                          {staticDataService.getBills().slice(0, 5).map(bill => (
                            <BillCard key={`${bill.congress}-${bill.billType}-${bill.billNumber}`} bill={convertApiBill(bill)} onViewDetails={bill => setSelectedBillForModal(bill)} isPinned={pinnedBills.includes(`${bill.billType.toUpperCase()}${bill.billNumber}`)} onTogglePin={handleTogglePin} />
                          ))}
                          <Box height="60px" /> {/* Extra spacing at the bottom to prevent footer overlap */}
                        </VStack>
                      )}
                    </Box>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          ) : (
            <Stack direction="column" spacing={8}>
              {/* Top Panel: Map and Member Interface side by side */}
              <HStack align="start" spacing={6} w="100%">
                <Box flex={1} minW={0}>
                  <EnhancedMap
                    bill={selectedBill}
                    selectedState={selectedState}
                    onSelectState={handleStateSelect}
                    setSelectedMember={setSelectedMember}
                    selectedMember={selectedMember}
                  />
                </Box>
                <Box flex={1} minW={0}>
                  {selectedMember && <MemberCard member={selectedMember} onRandom={handleRandomMember} setSelectedBillForModal={setSelectedBillForModal} />}
                </Box>
              </HStack>
              {/* Bottom Panel: Recent Bills */}
              <Box mb={6}>
                <Heading size="md" mb={4}>Recent Bills</Heading>
                <VStack spacing={4} align="stretch" mb={8}>
                  {staticDataService.getBills().slice(0, 5).map(bill => (
                    <BillCard
                      key={`${bill.congress}-${bill.billType}-${bill.billNumber}`}
                      bill={convertApiBill(bill)}
                      onViewDetails={bill => setSelectedBillForModal(bill)}
                      isPinned={pinnedBills.includes(`${bill.billType.toUpperCase()}${bill.billNumber}`)}
                      onTogglePin={handleTogglePin}
                    />
                  ))}
                </VStack>
              </Box>
            </Stack>
          )}
        </Container>

        {/* Main Content - Footer Divider */}
        <Box>
          <Divider borderColor="gray.200" />
        </Box>

        {/* Footer */}
        <Footer pinnedBills={pinnedBills} handleTogglePin={handleTogglePin} allBills={staticDataService.getBills().map(convertApiBill)} setSelectedBillForModal={setSelectedBillForModal} />

        {/* Search Modal */}
        <SearchModal isOpen={isSearchOpen} onClose={onSearchClose} setSelectedMember={setSelectedMember} setSelectedBill={setSelectedBill} setSelectedBillForModal={setSelectedBillForModal} pinnedBills={pinnedBills} handleTogglePin={handleTogglePin} />

      </Flex>

      {selectedBillForModal && (
        <BillSummary
          billId={`${selectedBillForModal.billType.toUpperCase()}${selectedBillForModal.billNumber}`}
          isOpen={!!selectedBillForModal}
          onClose={() => setSelectedBillForModal(null)}
          onSelectMember={member => {
            setSelectedMember(member);
            setSelectedBillForModal(null);
          }}
          isPinned={pinnedBills.includes(`${selectedBillForModal.billType.toUpperCase()}${selectedBillForModal.billNumber}`)}
          onTogglePin={() => handleTogglePin(selectedBillForModal)}
        />
      )}
    </ChakraProvider>
  );
};

export default App;