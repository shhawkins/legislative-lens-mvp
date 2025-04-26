import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Box,
  Heading,
  Text,
  Grid,
  Card,
  CardBody,
  Flex,
  VStack,
  Badge,
  Link,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Member } from '../../types/member';
import { Party } from '../../types/common';

const senatorAlex: Member = {
  id: 'S001',
  bioguideId: 'K000377',
  name: 'Sen. Alex Smith',
  state: 'CA',
  party: 'D',
  photoUrl: 'https://via.placeholder.com/150',
  committees: ['Judiciary', 'Finance'],
  votingRecord: [{ billId: 'B001', vote: 'yes' }],
  contactInfo: 'alex.smith@senate.gov',
  reelectionDate: '2024-11-05',
  depiction: {
    attribution: 'Courtesy U.S. Senate Historical Office',
    imageUrl: 'https://via.placeholder.com/150'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const senatorMaria: Member = {
  id: 'S002',
  bioguideId: 'G000789',
  name: 'Sen. Maria Garcia',
  state: 'CA',
  party: 'D',
  photoUrl: 'https://via.placeholder.com/150',
  committees: ['Energy', 'Foreign Relations'],
  votingRecord: [{ billId: 'B002', vote: 'no' }],
  contactInfo: 'maria.garcia@senate.gov',
  reelectionDate: '2026-11-05',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const repJohn: Member = {
  id: 'R001',
  bioguideId: 'L000174',
  name: 'Rep. John Doe',
  state: 'CA',
  district: '12',
  party: 'D',
  photoUrl: 'https://via.placeholder.com/150',
  committees: ['Energy and Commerce'],
  votingRecord: [{ billId: 'B003', vote: 'yes' }],
  contactInfo: 'john.doe@house.gov',
  reelectionDate: '2024-11-05',
  depiction: {
    attribution: 'Courtesy U.S. House Historical Office',
    imageUrl: 'https://via.placeholder.com/150'
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const repJane: Member = {
  id: 'R002',
  bioguideId: 'S000456',
  name: 'Rep. Jane Smith',
  state: 'CA',
  district: '15',
  party: 'R',
  photoUrl: 'https://via.placeholder.com/150',
  committees: ['Ways and Means'],
  votingRecord: [{ billId: 'B004', vote: 'no' }],
  contactInfo: 'jane.smith@house.gov',
  reelectionDate: '2024-11-05',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Mock data for development - this will be replaced with API data later
const mockStateMembers: Record<string, { senators: Member[], representatives: Member[] }> = {
  CA: {
    senators: [senatorAlex, senatorMaria],
    representatives: [repJohn, repJane]
  }
};

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

interface MemberCardProps {
  member: Member;
  showDistrict?: boolean;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, showDistrict = false }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Card variant="outline" bg={cardBg} borderColor={borderColor}>
      <CardBody>
        <Flex gap={4}>
          <Box
            as="img"
            src={member.photoUrl}
            alt={member.name}
            w="70px"
            h="70px"
            borderRadius="full"
            objectFit="cover"
          />
          <Box flex="1">
            <Flex justify="space-between" align="start">
              <Box>
                <Heading size="sm">{member.name}</Heading>
                <Flex gap={2} mt={1} align="center">
                  <Badge colorScheme={member.party === 'D' ? 'blue' : 'red'}>
                    {member.party === 'D' ? 'Democrat' : 'Republican'}
                  </Badge>
                  {showDistrict && member.district && (
                    <Badge colorScheme="purple">District {member.district}</Badge>
                  )}
                </Flex>
              </Box>
              <Link href={`mailto:${member.contactInfo}`} isExternal>
                <ExternalLinkIcon />
              </Link>
            </Flex>
            <Text fontSize="sm" color="gray.600" mt={2}>
              {member.committees.join(', ')}
            </Text>
            <Tooltip label={`Next election: ${member.reelectionDate}`}>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Term ends: {new Date(member.reelectionDate).getFullYear()}
              </Text>
            </Tooltip>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  );
};

interface StateMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  stateCode: string;
}

export const StateMembersModal: React.FC<StateMembersModalProps> = ({ isOpen, onClose, stateCode }) => {
  const stateMembers = mockStateMembers[stateCode as keyof typeof mockStateMembers] || { senators: [], representatives: [] };
  const stateName = stateList.find(state => state.code === stateCode)?.name || stateCode;
  const modalBg = useColorModeValue('white', 'gray.800');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent bg={modalBg}>
        <ModalHeader>
          <Heading size="lg">Congressional Delegation: {stateName}</Heading>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Senators and Representatives currently serving {stateName}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList mb={4}>
              <Tab>All Members</Tab>
              <Tab>Senators ({stateMembers.senators.length})</Tab>
              <Tab>Representatives ({stateMembers.representatives.length})</Tab>
            </TabList>
            <TabPanels>
              {/* All Members Panel */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="md" mb={4}>Senators</Heading>
                    <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
                      {stateMembers.senators.map((senator) => (
                        <MemberCard key={senator.id} member={senator} />
                      ))}
                    </Grid>
                  </Box>
                  <Box>
                    <Heading size="md" mb={4}>House Representatives</Heading>
                    <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
                      {stateMembers.representatives.map((rep) => (
                        <MemberCard key={rep.id} member={rep} showDistrict />
                      ))}
                    </Grid>
                  </Box>
                </VStack>
              </TabPanel>
              
              {/* Senators Panel */}
              <TabPanel px={0}>
                <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
                  {stateMembers.senators.map((senator) => (
                    <MemberCard key={senator.id} member={senator} />
                  ))}
                </Grid>
                {stateMembers.senators.length === 0 && (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No senators found for {stateName}
                  </Text>
                )}
              </TabPanel>
              
              {/* Representatives Panel */}
              <TabPanel px={0}>
                <Grid templateColumns="repeat(auto-fill, minmax(400px, 1fr))" gap={4}>
                  {stateMembers.representatives.map((rep) => (
                    <MemberCard key={rep.id} member={rep} showDistrict />
                  ))}
                </Grid>
                {stateMembers.representatives.length === 0 && (
                  <Text color="gray.500" textAlign="center" py={8}>
                    No representatives found for {stateName}
                  </Text>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StateMembersModal; 