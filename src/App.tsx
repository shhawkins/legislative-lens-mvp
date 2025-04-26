import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Bill } from './types/bill';
import { Member } from './types/member';
import { Committee } from './types/committee';
import theme from './theme';
import ApiTest from './components/test/ApiTest';

// Mock data
const mockBill: Bill = {
  id: 'B001',
  congress: 118,
  number: 'H.R.1234',
  title: 'Clean Energy Act',
  summary: 'Promotes renewable energy adoption.',
  status: 'In Committee',
  sponsor: 'Rep. John Doe',
  sponsors: ['Rep. John Doe'],
  text: 'Full bill text would go here...',
  committees: ['Energy and Commerce'],
  timeline: [
    { date: '2023-01-10', milestone: 'Introduced' },
    { date: '2023-02-15', milestone: 'Referred to Committee' },
  ],
  votes: [{ memberId: 'M001', state: 'CA', vote: 'yes' }],
  textVersions: [
    {
      date: '2023-03-30T04:00:00Z',
      type: 'Introduced',
      formats: [
        {
          type: 'PDF',
          url: 'https://example.com/bill.pdf'
        }
      ]
    }
  ]
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
    {bill.timeline.map((event, index) => (
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
          {index < bill.timeline.length - 1 && (
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
            {event.milestone}
          </Text>
        </Box>
      </Flex>
    ))}
  </Box>
));

// Update mock committee data
const mockCommittee: Committee = {
  id: "HSIF",
  name: "House Committee on Energy and Commerce",
  chamber: "house",
  congress: 118,
  subcommittees: [
    {
      id: "HSIF00",
      name: "Subcommittee on Innovation, Data, and Commerce",
      members: [
        {
          id: "M001",
          name: "Rep. John Doe",
          party: "D",
          state: "CA",
          title: "Chair"
        },
        {
          id: "M002",
          name: "Rep. Jane Smith",
          party: "R",
          state: "TX",
          title: "Ranking Member"
        }
      ]
    }
  ],
  members: [
    {
      id: "M001",
      name: "Rep. John Doe",
      party: "D",
      state: "CA",
      title: "Chair"
    },
    {
      id: "M002",
      name: "Rep. Jane Smith",
      party: "R",
      state: "TX",
      title: "Ranking Member"
    }
  ],
  meetings: [
    {
      id: "M001",
      date: "2024-03-15",
      time: "10:00 AM",
      title: "Hearing on Clean Energy Innovation",
      location: "2123 Rayburn House Office Building",
      description: "A hearing to discuss advancements in clean energy technology and policy.",
      status: "scheduled"
    },
    {
      id: "M002",
      date: "2024-03-10",
      time: "2:00 PM",
      title: "Markup of H.R. 1234",
      location: "2123 Rayburn House Office Building",
      description: "Markup session for the Clean Energy Act of 2024.",
      status: "completed"
    }
  ],
  reports: [
    {
      id: "R001",
      title: "Report on Clean Energy Innovation",
      date: "2024-02-15",
      reportNumber: "H. Rept. 118-123",
      url: "https://www.congress.gov/congressional-report/118th-congress/house-report/123"
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
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs>
            <TabList>
              <Tab>Members</Tab>
              <Tab>Meetings</Tab>
              <Tab>Reports</Tab>
            </TabList>

            <TabPanels>
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
                                {member.title && (
                                  <Text fontSize="sm" color="gray.600">
                                    {member.title}
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
                  {committee.subcommittees.length > 0 && (
                    <Box>
                      <Heading size="md" mb={4}>Subcommittees</Heading>
                      <VStack spacing={4} align="stretch">
                        {committee.subcommittees.map((subcommittee) => (
                          <Card key={subcommittee.id} variant="outline">
                            <CardHeader>
                              <Heading size="sm">{subcommittee.name}</Heading>
                            </CardHeader>
                            <CardBody>
                              <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
                                {subcommittee.members.map((member) => (
                                  <Box key={member.id}>
                                    <Text fontSize="sm" fontWeight="medium">{member.name}</Text>
                                    <Text fontSize="xs" color={member.party === 'D' ? 'blue.500' : 'red.500'}>
                                      {member.party === 'D' ? 'Democrat' : 'Republican'} - {member.state}
                                    </Text>
                                    {member.title && (
                                      <Text fontSize="xs" color="gray.600">
                                        {member.title}
                                      </Text>
                                    )}
                                  </Box>
                                ))}
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
                              {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
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
                </VStack>
              </TabPanel>

              {/* Reports Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {committee.reports?.map((report) => (
                    <Card key={report.id} variant="outline">
                      <CardBody>
                        <Heading size="sm" mb={2}>{report.title}</Heading>
                        <Text fontSize="sm" color="gray.600">
                          {report.reportNumber} • {new Date(report.date).toLocaleDateString()}
                        </Text>
                        <Link
                          href={report.url}
                          isExternal
                          color="blue.500"
                          mt={2}
                          display="inline-block"
                        >
                          View Report <ExternalLinkIcon mx="2px" />
                        </Link>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Update BillSummary component to make committees clickable
const BillSummary: React.FC<{ bill: Bill }> = ({ bill }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommitteeOpen, onOpen: onCommitteeOpen, onClose: onCommitteeClose } = useDisclosure();
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  const handleCommitteeClick = (committeeName: string) => {
    // In a real implementation, this would fetch committee data from the API
    // For now, we'll use the mock data
    setSelectedCommittee(mockCommittee);
    onCommitteeOpen();
  };

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Top Panel - Bill Summary */}
        <HStack spacing={6} align="stretch">
          <Box flex="1">
            <Card>
              <CardHeader>
                <Heading size="md">{bill.title}</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="md" lineHeight="tall">
                  {bill.summary}
                </Text>
                <Text mt={4}><strong>Status:</strong> {bill.status}</Text>
                <Text><strong>Sponsors:</strong> {bill.sponsors.join(', ')}</Text>
                <Text>
                  <strong>Committees:</strong>{' '}
                  {bill.committees.map((committee, index) => (
                    <React.Fragment key={committee}>
                      {index > 0 && ', '}
                      <Box
                        as="span"
                        color="blue.500"
                        cursor="pointer"
                        _hover={{ textDecoration: 'underline' }}
                        onClick={() => handleCommitteeClick(committee)}
                      >
                        {committee}
                      </Box>
                    </React.Fragment>
                  ))}
                </Text>
                <Button mt={4} onClick={onOpen}>View Full Details</Button>
              </CardBody>
            </Card>
          </Box>
        </HStack>

        {/* Bottom Panel - Key Takeaways */}
        <Card>
          <CardHeader>
            <Heading size="md">Key Takeaways</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="md">
                • This bill focuses on promoting renewable energy adoption across the United States
              </Text>
              <Text fontSize="md">
                • It includes provisions for tax incentives for clean energy projects
              </Text>
              <Text fontSize="md">
                • The bill establishes new energy efficiency standards for federal buildings
              </Text>
              <Text fontSize="md">
                • It creates a new grant program for renewable energy research and development
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Committee Modal */}
      {selectedCommittee && (
        <CommitteeModal
          isOpen={isCommitteeOpen}
          onClose={onCommitteeClose}
          committee={selectedCommittee}
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="85vw" maxH="85vh" margin="auto">
          <ModalHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">{bill.title}</Heading>
              <Select
                placeholder="Select version"
                size="sm"
                width="200px"
                defaultValue={bill.textVersions[0]?.type}
              >
                {bill.textVersions.map((version) => (
                  <option key={version.date} value={version.type}>
                    {version.type} - {new Date(version.date).toLocaleDateString()}
                  </option>
                ))}
              </Select>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="1fr 2px 1fr" gap={6} h="calc(85vh - 200px)">
              {/* Left Panel - Bill Details */}
              <Box overflowY="auto" pr={4}>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="sm" mb={2}>Summary</Heading>
                    <Text>{bill.summary}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Status</Heading>
                    <Text>{bill.status}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Sponsors</Heading>
                    <Text>{bill.sponsors.join(', ')}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Committees</Heading>
                    <Text>{bill.committees.join(', ')}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Timeline</Heading>
                    <Timeline bill={bill} />
                  </Box>
                </VStack>
              </Box>

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

              {/* Right Panel - Bill Text */}
              <Box
                overflowY="auto"
                bg="gray.50"
                borderRadius="md"
                p={4}
                fontFamily="monospace"
                whiteSpace="pre-wrap"
              >
                {bill.textVersions[0]?.text || "Full bill text not available"}
              </Box>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
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
    bill?.votes.forEach(vote => {
      if (vote.state) {
        colors[vote.state] = getVoteColor(vote.vote || 'no');
      }
    });
    return colors;
  }, [bill]);

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

// Enhanced Footer Component
const Footer: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pinnedBills] = useState([mockBill]); // Mock data for now

  return (
    <Box py={6} px={8} bg="gray.50">
      <Accordion allowMultiple defaultIndex={[0, 1]}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={8}
          divider={
            <Divider
              display={{ base: 'none', md: 'block' }}
              orientation="vertical"
              height={{ md: 'inherit' }}
            />
          }
        >
          {/* Daily Highlights Section */}
          <AccordionItem flex="1" border="none">
            {({ isExpanded }) => (
              <>
                <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                  <Heading size="md" flex="1" textAlign="left">Daily Highlights</Heading>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel px={0}>
                  <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                    {[1, 2, 3].map((i) => (
                      <Card key={i} variant="outline" bg="white">
                        <CardBody>
                          <Text fontSize="sm" color="gray.500" mb={2}>
                            {new Date().toLocaleDateString()}
                          </Text>
                          <Heading size="sm" mb={2}>
                            Committee Hearing: {mockBill.committees[0]}
                          </Heading>
                          <Text fontSize="sm" noOfLines={2}>
                            Discussion on {mockBill.title} - {mockBill.summary}
                          </Text>
                          <Box
                            as="div"
                            onClick={onOpen}
                            cursor="pointer"
                            color="blue.500"
                            _hover={{ color: 'blue.600' }}
                            mt={3}
                            fontSize="sm"
                          >
                            Learn More
                          </Box>
                        </CardBody>
                      </Card>
                    ))}
                  </Grid>
                </AccordionPanel>
              </>
            )}
          </AccordionItem>

          {/* Pinned Bills Section */}
          <AccordionItem width={{ base: 'full', md: '250px' }} border="none">
            {({ isExpanded }) => (
              <>
                <AccordionButton px={0} _hover={{ bg: 'transparent' }}>
                  <Flex width="100%" align="center" justify="space-between">
                    <Heading size="md" textAlign="left">Pinned Bills</Heading>
                    <Flex align="center">
                      <Box
                        as="div"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpen();
                        }}
                        mr={2}
                        cursor="pointer"
                        color="blue.500"
                        _hover={{ color: 'blue.600' }}
                        fontSize="sm"
                        display="flex"
                        alignItems="center"
                      >
                        <Icon as={pinnedBills.length ? ViewIcon : AddIcon} mr={1} />
                        {pinnedBills.length ? 'View All' : 'Pin Bills'}
                      </Box>
                      <AccordionIcon />
                    </Flex>
                  </Flex>
                </AccordionButton>
                <AccordionPanel px={0}>
                  {pinnedBills.length > 0 ? (
                    <Stack spacing={2}>
                      {pinnedBills.slice(0, 2).map((bill, index) => (
                        <Text key={index} fontSize="sm" noOfLines={1}>
                          • {bill.title}
                        </Text>
                      ))}
                      {pinnedBills.length > 2 && (
                        <Text fontSize="sm" color="gray.500">
                          +{pinnedBills.length - 2} more
                        </Text>
                      )}
                    </Stack>
                  ) : (
                    <Text fontSize="sm" color="gray.500">
                      No pinned bills yet
                    </Text>
                  )}
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        </Stack>
      </Accordion>

      {/* Pinned Bills Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Pinned Bills</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4} pb={4}>
              {pinnedBills.length > 0 ? (
                pinnedBills.map((bill) => (
                  <Card key={bill.id} variant="outline">
                    <CardBody>
                      <Heading size="sm" mb={2}>{bill.title}</Heading>
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {bill.summary}
                      </Text>
                      <Flex justify="space-between" align="center" mt={3}>
                        <Text fontSize="sm" color="gray.500">
                          Status: {bill.status}
                        </Text>
                        <Box
                          as="div"
                          onClick={onClose}
                          cursor="pointer"
                          color="red.500"
                          _hover={{ color: 'red.600' }}
                          fontSize="sm"
                        >
                          Unpin
                        </Box>
                      </Flex>
                    </CardBody>
                  </Card>
                ))
              ) : (
                <Text color="gray.500" textAlign="center">
                  No bills pinned yet. Pin bills to track them here.
                </Text>
              )}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Enhanced Search Modal Component
const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'bills' | 'members' | 'committees'>('bills');
  const [searchResults, setSearchResults] = useState<{
    bills: Bill[];
    members: Member[];
    committees: Committee[];
  }>({ bills: [], members: [], committees: [] });
  const { isOpen: isCommitteeOpen, onOpen: onCommitteeOpen, onClose: onCommitteeClose } = useDisclosure();
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock search results
    setSearchResults({
      bills: [mockBill],
      members: [mockMember],
      committees: [mockCommittee]
    });
    
    setIsLoading(false);
  }, []);

  const handleCommitteeClick = (committee: Committee) => {
    setSelectedCommittee(committee);
    onCommitteeOpen();
  };

  const debouncedSearch = useMemo(
    () => debounce(handleSearch, 300),
    [handleSearch]
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults({ bills: [], members: [], committees: [] });
    }
    return () => debouncedSearch.cancel();
  }, [searchQuery, debouncedSearch]);

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
              <Tab>Bills</Tab>
              <Tab>Members</Tab>
              <Tab>Committees</Tab>
            </TabList>
            <TabPanels>
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
                      <Card key={bill.id} variant="outline" cursor="pointer" _hover={{ bg: 'gray.50' }}>
                        <CardBody>
                          <Heading size="sm">{bill.title}</Heading>
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {bill.summary}
                          </Text>
                          <Text fontSize="xs" color="gray.500" mt={2}>
                            Status: {bill.status}
                          </Text>
                        </CardBody>
                      </Card>
                    ))}
                  </Stack>
                )}
              </TabPanel>
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
                          <Flex gap={4}>
                            <Box
                              as="img"
                              src={member.photoUrl}
                              alt={`${member.firstName} ${member.lastName}`}
                              w="50px"
                              h="50px"
                              borderRadius="full"
                            />
                            <Box>
                              <Heading size="sm">{member.fullName}</Heading>
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
                  </Stack>
                )}
              </TabPanel>
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
                          <Heading size="sm">{committee.name}</Heading>
                          <Text fontSize="sm" color="gray.600">
                            {committee.chamber.charAt(0).toUpperCase() + committee.chamber.slice(1)} Committee
                          </Text>
                        </CardBody>
                      </Card>
                    ))}
                  </Stack>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>

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
                    <Box bg="white" p={4} rounded="md" shadow="sm">
                      <BillSummary bill={selectedBill} />
                    </Box>
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
                <Box p={4} bg="gray.50" rounded="md">
                  <BillSummary bill={selectedBill} />
                </Box>
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
        <Box as="footer" bg="white" borderTop="1px" borderColor="gray.200" py={6}>
          <Container maxW="container.xl">
            <Footer />
          </Container>
        </Box>

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