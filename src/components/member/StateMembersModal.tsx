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
  useColorModeValue,
  Spinner,
  Button,
  useDisclosure,
  HStack,
} from '@chakra-ui/react';
import { ExternalLinkIcon, InfoIcon } from '@chakra-ui/icons';
import { Member, convertApiMember } from '../../types/member';
import { Party } from '../../types/common';
import { staticDataService } from '../../services/staticDataService';

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
  onSelectMember?: (member: Member) => void;
}

const MemberCard: React.FC<{ member: Member; showDistrict?: boolean; onViewProfile?: () => void; onSelect?: (member: Member) => void }> = ({ 
  member, 
  showDistrict = false,
  onSelect
}) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const partyColor = member.party === 'D' ? 'blue' : member.party === 'R' ? 'red' : 'purple';
  const chamberColor = 'purple';
  const age = member.birthYear ? new Date().getFullYear() - parseInt(member.birthYear.slice(0, 4)) : undefined;

  return (
    <Card 
      bg={cardBg} 
      border="1px" 
      borderColor={borderColor}
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', cursor: onSelect ? 'pointer' : 'default' }}
      transition="all 0.2s"
      onClick={onSelect ? () => onSelect(member) : undefined}
    >
      <CardBody>
        <Flex direction="column" gap={3} position="relative">
          <Flex justify="space-between" align="center" position="relative">
            <VStack align="start" spacing={0}>
              <Heading size="md">
                {member.firstName} {member.lastName}
              </Heading>
              <HStack spacing={2} mt={1} mb={1}>
                <Badge colorScheme={partyColor}>
                  {member.party === 'D' ? 'Democrat' : member.party === 'R' ? 'Republican' : 'Independent'}
                </Badge>
                <Badge colorScheme={chamberColor}>
                  {member.chamber === 'senate' ? 'Senate' : 'House'}
                </Badge>
              </HStack>
              <Text fontSize="sm" color="gray.500">
                {member.state}{showDistrict && member.district && `-${member.district}`}
              </Text>
              {age && (
                <Text fontSize="sm" color="gray.600">Age: {age}</Text>
              )}
            </VStack>
          </Flex>
            {member.committees?.map(committee => (
              <Badge key={committee} colorScheme="blue" variant="outline">
                {committee}
              </Badge>
            ))}
          </Flex>

          {member.contactInfo && (
            <Box>
              <Text fontSize="sm" fontWeight="medium">Contact:</Text>
              <Text fontSize="sm">{member.contactInfo}</Text>
            </Box>
          )}

          {member.reelectionDate && (
            <Box>
              <Text fontSize="sm" fontWeight="medium">Next Election:</Text>
              <Text fontSize="sm">{new Date(member.reelectionDate).toLocaleDateString()}</Text>
            </Box>
          )}

          <Flex justify="space-between" align="center">
            <Link href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}`} isExternal>
              <Button size="sm" variant="ghost" colorScheme="blue" leftIcon={<ExternalLinkIcon />} mt={2}>
                View on Congress.gov
              </Button>
            </Link>
            {member.depiction?.imageUrl && (
              <Box
                as="img"
                src={member.depiction.imageUrl}
                alt={`${member.firstName} ${member.lastName}`}
                w="60px"
                h="60px"
                borderRadius="full"
                objectFit="cover"
                borderWidth="3px"
                borderColor={`${partyColor}.500`}
              />
            )}
          </Flex>
      </CardBody>
    </Card>
  );
};

const StateMembersModal: React.FC<StateMembersModalProps> = ({ isOpen, onClose, stateCode, stateName, onSelectMember }) => {
  console.log("StateMembersModal rendering with: ", { stateCode, stateName });
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [senators, setSenators] = useState<Member[]>([]);
  const [representatives, setRepresentatives] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { isOpen: isMemberModalOpen, onOpen: onMemberModalOpen, onClose: onMemberModalClose } = useDisclosure();

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const allMembers = staticDataService.getMembersByState(stateCode);
        setSenators(allMembers.filter(m => m.chamber === 'senate'));
        setRepresentatives(allMembers.filter(m => m.chamber === 'house'));
      } catch (err) {
        setError('Failed to load members for this state.');
      } finally {
        setIsLoading(false);
      }
    };
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, stateCode]);

  const handleViewProfile = (member: Member) => {
    setSelectedMember(member);
    onMemberModalOpen();
  };

  const handleSelectMember = (member: Member) => {
    if (onSelectMember) onSelectMember(member);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent 
        maxW={{ base: "90%", md: "75vw" }}
        maxH={{ base: "90vh", md: "85vh" }}
        h={{ base: "90vh", md: "85vh" }}
        display="flex"
        flexDirection="column"
        margin="auto"
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
          <Heading size="lg">Congressional Delegation: {stateCode}</Heading>
          <Text fontSize="md" color="gray.600" mt={2}>
            Senators and Representatives serving {stateCode}
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} flex="1" overflowY="auto">
          {isLoading ? (
            <Flex justify="center" align="center" minH="300px">
              <Spinner size="xl" />
            </Flex>
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : (
            <Tabs index={activeTab} onChange={setActiveTab}>
              <TabList>
                <Tab>All Members ({senators.length + representatives.length})</Tab>
                <Tab>Senators (2)</Tab>
                <Tab>Representatives ({representatives.length})</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                    {senators.length === 0 && representatives.length === 0 ? (
                      <Text>No members found for this state.</Text>
                    ) : (
                      <>
                        {senators.map(senator => (
                          <MemberCard 
                            key={senator.id} 
                            member={senator} 
                            onViewProfile={() => handleViewProfile(senator)}
                            onSelect={handleSelectMember}
                          />
                        ))}
                        {representatives.map(rep => (
                          <MemberCard 
                            key={rep.id} 
                            member={rep} 
                            showDistrict 
                            onViewProfile={() => handleViewProfile(rep)}
                            onSelect={handleSelectMember}
                          />
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
                        <MemberCard 
                          key={senator.id} 
                          member={senator} 
                          onViewProfile={() => handleViewProfile(senator)}
                          onSelect={handleSelectMember}
                        />
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
                        <MemberCard 
                          key={rep.id} 
                          member={rep} 
                          showDistrict 
                          onViewProfile={() => handleViewProfile(rep)}
                          onSelect={handleSelectMember}
                        />
                      ))
                    )}
                  </Grid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>
      </ModalContent>

      {/* Member Profile Modal */}
      {selectedMember && (
        <Modal isOpen={isMemberModalOpen} onClose={onMemberModalClose} size="xl">
          <ModalOverlay />
          <ModalContent
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
              <Heading size="lg">{selectedMember.fullName || `${selectedMember.firstName} ${selectedMember.lastName}`}</Heading>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {selectedMember.state}{selectedMember.district ? `-${selectedMember.district}` : ''} • {selectedMember.party === 'D' ? 'Democrat' : selectedMember.party === 'R' ? 'Republican' : 'Independent'}
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Grid templateColumns={{ base: '1fr', md: '1fr 2fr' }} gap={6}>
                {/* Left Column - Member Info */}
                <Box>
                  <Box
                    as="img"
                    src={selectedMember.depiction?.imageUrl || selectedMember.photoUrl}
                    alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
                    w="100%"
                    maxW="300px"
                    borderRadius="lg"
                    objectFit="cover"
                    border="3px solid"
                    borderColor={selectedMember.party === 'D' ? 'blue.500' : 'red.500'}
                  />
                  <Box mt={4}>
                    <Heading size="sm" mb={2}>Contact Information</Heading>
                    <Text fontSize="sm">{selectedMember.contactInfo || 'Not available'}</Text>
                    {selectedMember.reelectionDate ? (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Next Election: {new Date(selectedMember.reelectionDate).toLocaleDateString()}
                      </Text>
                    ) : (
                      <Text color="gray.400">Next Election: Not available</Text>
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
                          {selectedMember.committees && selectedMember.committees.length > 0 ? (
                            selectedMember.committees.map((committee, index) => (
                              <Card key={index} variant="outline">
                                <CardBody>
                                  <Text fontSize="md" fontWeight="medium">{committee}</Text>
                                </CardBody>
                              </Card>
                            ))
                          ) : (
                            <Text color="gray.400">Not available</Text>
                          )}
                        </VStack>
                      </TabPanel>
                      {/* Voting Record Panel */}
                      <TabPanel>
                        <VStack spacing={4} align="stretch">
                          {selectedMember.votingRecord && selectedMember.votingRecord.length > 0 ? (
                            selectedMember.votingRecord.map((record, index) => (
                              <Card key={index} variant="outline">
                                <CardBody>
                                  <Flex justify="space-between" align="center">
                                    <Box>
                                      <Link 
                                        href={`https://www.congress.gov/bill/119th-congress/${record.billId.startsWith('HR') ? 'house-bill' : 'senate-bill'}/${record.billId.substring(2)}`} 
                                        isExternal 
                                        color="blue.500"
                                      >
                                        Bill {record.billId}
                                      </Link>
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
                            ))
                          ) : (
                            <Text color="gray.400">Not available</Text>
                          )}
                        </VStack>
                      </TabPanel>
                      {/* Biography Panel */}
                      <TabPanel>
                        <Box>
                          {selectedMember.depiction?.attribution && (
                            <Text fontSize="sm" color="gray.500" mb={2}>
                              Photo: {selectedMember.depiction.attribution}
                            </Text>
                          )}
                          <Text fontSize="md">
                            {selectedMember.fullName} represents {selectedMember.state}{selectedMember.district ? `'s ${selectedMember.district}th district` : ''} in the {selectedMember.district ? 'House of Representatives' : 'Senate'}. 
                            As a {selectedMember.party === 'D' ? 'Democrat' : selectedMember.party === 'R' ? 'Republican' : 'Independent'}, they serve on the following committees: {selectedMember.committees && selectedMember.committees.length > 0 ? selectedMember.committees.join(', ') : 'Not available'}.
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
      )}
    </Modal>
  );
};

export default StateMembersModal; 