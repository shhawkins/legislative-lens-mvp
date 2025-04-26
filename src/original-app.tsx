import React, { useState, useMemo } from 'react';
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
} from '@chakra-ui/react';

// Mock Data Schema (mimics Congress.gov API)
interface Bill {
  id: string;
  title: string;
  summary: string;
  status: string;
  sponsors: string[];
  committees: string[];
  timeline: { date: string; milestone: string }[];
  votes: { memberId: string; state: string; vote: 'yes' | 'no' }[];
}

interface Member {
  id: string;
  name: string;
  state: string;
  district?: string;
  party: 'D' | 'R';
  photoUrl: string;
  committees: string[];
  votingRecord: { billId: string; vote: 'yes' | 'no' }[];
  contactInfo: string;
  reelectionDate: string;
}

const mockBill: Bill = {
  id: 'B001',
  title: 'Clean Energy Act',
  summary: 'Promotes renewable energy adoption.',
  status: 'In Committee',
  sponsors: ['Rep. John Doe'],
  committees: ['Energy and Commerce'],
  timeline: [
    { date: '2023-01-10', milestone: 'Introduced' },
    { date: '2023-02-15', milestone: 'Referred to Committee' },
  ],
  votes: [{ memberId: 'M001', state: 'CA', vote: 'yes' }],
};

const mockMember: Member = {
  id: 'M001',
  name: 'Rep. John Doe',
  state: 'CA',
  district: '12',
  party: 'D',
  photoUrl: 'https://via.placeholder.com/150',
  committees: ['Energy and Commerce'],
  votingRecord: [{ billId: 'B001', vote: 'yes' }],
  contactInfo: 'john.doe@house.gov',
  reelectionDate: '2024-11-05',
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

// Timeline Component
const Timeline: React.FC<{ bill: Bill }> = React.memo(({ bill }) => (
  <Flex direction="column" gap={4}>
    {bill.timeline.map((event, index) => (
      <Flex key={index} align="center">
        <Box position="relative" mr={4}>
          <Box w="12px" h="12px" bg="blue.500" borderRadius="full" />
          {index < bill.timeline.length - 1 && (
            <Divider orientation="vertical" position="absolute" top="12px" left="5px" h="calc(100% + 16px)" />
          )}
        </Box>
        <Box>
          <Text fontWeight="bold">{event.date}</Text>
          <Text>{event.milestone}</Text>
        </Box>
      </Flex>
    ))}
  </Flex>
));

// Bill Summary Component
const BillSummary: React.FC<{ bill: Bill }> = ({ bill }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Card>
        <CardHeader>
          <Heading size="md">{bill.title}</Heading>
        </CardHeader>
        <CardBody>
          <Text>{bill.summary}</Text>
          <Text mt={2}><strong>Status:</strong> {bill.status}</Text>
          <Text><strong>Sponsors:</strong> {bill.sponsors.join(', ')}</Text>
          <Text><strong>Committees:</strong> {bill.committees.join(', ')}</Text>
          <Button mt={4} onClick={onOpen}>View Full Details</Button>
        </CardBody>
      </Card>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{bill.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{bill.summary}</Text>
            {/* Add more detailed bill info here */}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

// Interactive Map Component (Simplified Mock)
const InteractiveMap: React.FC<{ bill: Bill | null; selectedState: string | null; onSelectState: (state: string) => void }> = ({ bill, selectedState, onSelectState }) => {
  const states = ['CA', 'TX', 'NY']; // Mock states
  const voteColors = useMemo(() => {
    if (!bill) return {} as Record<string, string>;
    return bill.votes.reduce((acc, vote) => ({
      ...acc,
      [vote.state]: vote.vote === 'yes' ? 'blue.300' : 'red.300',
    }), {} as Record<string, string>);
  }, [bill]);

  return (
    <Flex wrap="wrap" gap={2}>
      {states.map((state) => (
        <Box
          key={state}
          w="50px"
          h="50px"
          bg={voteColors[state] || 'gray.200'}
          border={selectedState === state ? '2px solid blue' : 'none'}
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          onClick={() => onSelectState(state)}
        >
          <Text>{state}</Text>
        </Box>
      ))}
    </Flex>
  );
};

// Member Card Component
const MemberCard: React.FC<{ member: Member }> = ({ member }) => (
  <Card>
    <CardHeader>
      <Heading size="md">{member.name}</Heading>
    </CardHeader>
    <CardBody>
      <Box as="img" src={member.photoUrl} alt={member.name} w="100px" h="100px" borderRadius="full" mb={4} />
      <Text><strong>State:</strong> {member.state}{member.district ? `-${member.district}` : ''}</Text>
      <Text><strong>Party:</strong> {member.party === 'D' ? 'Democrat' : 'Republican'}</Text>
      <Text><strong>Committees:</strong> {member.committees.join(', ')}</Text>
      <Text><strong>Contact:</strong> {member.contactInfo}</Text>
      <Text><strong>Reelection:</strong> {member.reelectionDate}</Text>
    </CardBody>
  </Card>
);

// Footer Component
const Footer: React.FC = () => (
  <Flex direction={{ base: 'column', md: 'row' }} gap={4} p={4} bg="gray.100">
    <Box flex={1}>
      <Heading size="sm">Daily Highlights</Heading>
      <Text>Featured Bill: Clean Energy Act</Text>
    </Box>
    <Box flex={1}>
      <Heading size="sm">Pinned Bills</Heading>
      <Text>No pinned bills yet.</Text>
    </Box>
  </Flex>
);

// Main App Component
const App: React.FC = () => {
  const isMobile = useResponsiveLayout();
  const [selectedBill, setSelectedBill] = useState<Bill>(mockBill);
  const [selectedMember, setSelectedMember] = useState<Member>(mockMember);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setSelectedMember(mockMember); // Mocked for now
    toast({ title: `Selected ${state}`, status: 'info', duration: 2000 });
  };

  return (
    <ChakraProvider>
      <Flex direction="column" minH="100vh">
        {/* Header */}
        <Box p={4} bg="blue.500" color="white">
          <Flex justify="space-between" align="center">
            <Heading size="md">Congress Explorer</Heading>
            <Input
              placeholder="Search bills or members..."
              width={{ base: '100%', md: '300px' }}
              bg="white"
              color="black"
              onClick={onOpen}
            />
          </Flex>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Search</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Search functionality coming soon!</Text>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Box>

        {/* Main Content */}
        {isMobile ? (
          <Accordion allowToggle>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">Bill Interface</Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Flex direction="column" gap={4}>
                  <Timeline bill={selectedBill} />
                  <BillSummary bill={selectedBill} />
                </Flex>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">Member Interface</Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Flex direction="column" gap={4}>
                  <InteractiveMap bill={selectedBill} selectedState={selectedState} onSelectState={handleStateSelect} />
                  <MemberCard member={selectedMember} />
                </Flex>
              </AccordionPanel>
            </AccordionItem>
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">Footer</Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <Footer />
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        ) : (
          <Grid templateColumns="1fr 1fr" flex={1} gap={4} p={4}>
            <Flex direction="column" gap={4}>
              <Timeline bill={selectedBill} />
              <BillSummary bill={selectedBill} />
            </Flex>
            <Divider orientation="vertical" />
            <Flex direction="column" gap={4}>
              <InteractiveMap bill={selectedBill} selectedState={selectedState} onSelectState={handleStateSelect} />
              <MemberCard member={selectedMember} />
            </Flex>
          </Grid>
        )}

        {/* Footer */}
        {!isMobile && <Footer />}
      </Flex>
    </ChakraProvider>
  );
};

export default App;