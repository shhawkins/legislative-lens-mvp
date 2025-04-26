import React, { useEffect, useState } from 'react';
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
  Spinner,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Member, convertApiMember } from '../../types/member';
import { Party } from '../../types/common';
import { ApiService } from '../../services/api/ApiService';
import { Member as ApiMember } from '../../services/api/types';

const mockMembers: Member[] = [
  {
    id: 'S001',
    bioguideId: 'K000377',
    firstName: 'Alex',
    lastName: 'Smith',
    fullName: 'Alex Smith',
    state: 'CA',
    party: 'D',
    chamber: 'senate',
    committees: ['Judiciary', 'Finance'],
    photoUrl: 'https://via.placeholder.com/150',
    contactInfo: 'alex.smith@senate.gov',
    depiction: {
      attribution: 'Courtesy U.S. Senate Historical Office',
      imageUrl: 'https://via.placeholder.com/150'
    }
  },
  {
    id: 'S002',
    bioguideId: 'G000789',
    firstName: 'Maria',
    lastName: 'Garcia',
    fullName: 'Maria Garcia',
    state: 'CA',
    party: 'D',
    chamber: 'senate',
    committees: ['Energy', 'Foreign Relations'],
    photoUrl: 'https://via.placeholder.com/150',
    contactInfo: 'maria.garcia@senate.gov'
  },
  {
    id: 'R001',
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
    contactInfo: 'john.doe@house.gov',
    depiction: {
      attribution: 'Courtesy U.S. House Historical Office',
      imageUrl: 'https://via.placeholder.com/150'
    }
  }
];

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

interface StateMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  stateCode: string;
  stateName: string;
}

const MemberCard: React.FC<{ member: Member; showDistrict?: boolean }> = ({ member, showDistrict = false }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const partyColor = member.party === 'D' ? 'blue.500' : member.party === 'R' ? 'red.500' : 'purple.500';

  return (
    <Card 
      bg={cardBg} 
      border="1px" 
      borderColor={borderColor}
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
      transition="all 0.2s"
    >
      <CardBody>
        <Flex direction="column" gap={3}>
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={0}>
              <Heading size="md">
                {member.firstName} {member.lastName}
              </Heading>
              <Text fontSize="sm" color="gray.500">
                {member.party === 'D' ? 'Democrat' : member.party === 'R' ? 'Republican' : 'Independent'}
              </Text>
            </VStack>
            <Badge 
              colorScheme={member.party === 'D' ? 'blue' : member.party === 'R' ? 'red' : 'purple'}
              fontSize="md"
              px={3}
              py={1}
            >
              {member.party}
            </Badge>
          </Flex>

          {showDistrict && member.district && (
            <Text fontSize="sm" color="gray.600">
              District {member.district}
            </Text>
          )}

          <Flex gap={2} wrap="wrap">
            {member.committees?.map(committee => (
              <Tooltip key={committee} label={committee}>
                <Badge colorScheme="gray" fontSize="xs">
                  {committee}
                </Badge>
              </Tooltip>
            ))}
          </Flex>

          <Flex justify="space-between" align="center" mt="auto">
            <Text fontSize="sm" color="gray.500">
              {member.chamber === 'senate' ? 'Senator' : 'Representative'} from {member.state}
            </Text>
            <Link 
              href={`https://www.congress.gov/member/${member.firstName.toLowerCase()}-${member.lastName.toLowerCase()}/${member.bioguideId}`}
              isExternal
              color={partyColor}
            >
              View Profile <ExternalLinkIcon mx="2px" />
            </Link>
          </Flex>
        </Flex>
      </CardBody>
    </Card>
  );
};

const StateMembersModal: React.FC<StateMembersModalProps> = ({ isOpen, onClose, stateCode, stateName }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [senators, setSenators] = useState<Member[]>([]);
  const [representatives, setRepresentatives] = useState<Member[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch members from API
        const apiService = ApiService.getInstance();
        const [senatorsResponse, repsResponse] = await Promise.all([
          apiService.getMembers(118, 'senate'),
          apiService.getMembers(118, 'house')
        ]);

        // Filter by state and convert API members to our Member type
        setSenators(
          (senatorsResponse.members?.filter((m: ApiMember) => m.state === stateCode) || [])
            .map(convertApiMember)
        );
        setRepresentatives(
          (repsResponse.members?.filter((m: ApiMember) => m.state === stateCode) || [])
            .map(convertApiMember)
        );
      } catch (err) {
        setError('Failed to fetch members. Please try again later.');
        console.error('Error fetching members:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, stateCode]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Congressional Delegation: {stateName}</Heading>
          <Text fontSize="md" color="gray.600" mt={2}>
            Senators and Representatives currently serving {stateName}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {isLoading ? (
            <Flex justify="center" align="center" minH="300px">
              <Spinner size="xl" />
            </Flex>
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : (
            <Tabs index={activeTab} onChange={setActiveTab}>
              <TabList>
                <Tab>All Members</Tab>
                <Tab>Senators</Tab>
                <Tab>Representatives</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                    {senators.length === 0 && representatives.length === 0 ? (
                      <Text>No members found for this state.</Text>
                    ) : (
                      <>
                        {senators.map(senator => (
                          <MemberCard key={senator.id} member={senator} />
                        ))}
                        {representatives.map(rep => (
                          <MemberCard key={rep.id} member={rep} showDistrict />
                        ))}
                      </>
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                    {senators.length === 0 ? (
                      <Text>No senators found for {stateName}</Text>
                    ) : (
                      senators.map(senator => (
                        <MemberCard key={senator.id} member={senator} />
                      ))
                    )}
                  </Grid>
                </TabPanel>

                <TabPanel>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                    {representatives.length === 0 ? (
                      <Text>No representatives found for {stateName}</Text>
                    ) : (
                      representatives.map(rep => (
                        <MemberCard key={rep.id} member={rep} showDistrict />
                      ))
                    )}
                  </Grid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StateMembersModal; 