import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  VStack,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import { Bill } from '../../services/api/types';
import { Committee } from '../../types/committee';
import Timeline from './Timeline';
import CommitteeModal from '../committee/CommitteeModal';
import { ApiService } from '../../services/api/ApiService';

interface BillSummaryProps {
  billId: string;
}

/**
 * BillSummary component displays a comprehensive overview of a bill,
 * including its title, summary, status, sponsors, and committees.
 * It also provides access to the full bill text and committee information.
 * 
 * @param {BillSummaryProps} props - Component props
 * @param {string} props.billId - The bill ID in format "congress-type-number" (e.g., "118-hr-1234")
 * @returns {JSX.Element} Bill summary component
 */
const BillSummary: React.FC<BillSummaryProps> = ({ billId }) => {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommitteeOpen, onOpen: onCommitteeOpen, onClose: onCommitteeClose } = useDisclosure();
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const [congress, type, number] = billId.split('-');
        const apiService = ApiService.getInstance();
        const response = await apiService.getBillById(parseInt(congress), type, number);
        setBill(response.bills?.[0] || null);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bill:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bill');
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId]);

  const handleCommitteeClick = (committeeName: string) => {
    // In a real implementation, this would fetch committee data from the API
    // For now, we'll use mock data
    setSelectedCommittee({
      id: "HSIF",
      name: committeeName,
      chamber: "house",
      congress: 118,
      subcommittees: [],
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    onCommitteeOpen();
  };

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} bg="red.100" color="red.700" borderRadius="md">
        <Text>Error: {error}</Text>
      </Box>
    );
  }

  if (!bill) {
    return (
      <Box p={4} bg="yellow.100" color="yellow.700" borderRadius="md">
        <Text>Bill not found</Text>
      </Box>
    );
  }

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
                  {bill.summaries.list[0]?.text || 'No summary available'}
                </Text>
                <Text mt={4}><strong>Status:</strong> {bill.latestAction.text}</Text>
                <Text>
                  <strong>Sponsors:</strong>{' '}
                  {bill.sponsors.map((sponsor, index) => (
                    <React.Fragment key={sponsor.bioguideId}>
                      {index > 0 && ', '}
                      {sponsor.fullName}
                    </React.Fragment>
                  ))}
                </Text>
                <Text>
                  <strong>Committees:</strong>{' '}
                  {bill.committees.list.map((committee, index) => (
                    <React.Fragment key={committee.systemCode}>
                      {index > 0 && ', '}
                      <Box
                        as="span"
                        color="blue.500"
                        cursor="pointer"
                        _hover={{ textDecoration: 'underline' }}
                        onClick={() => handleCommitteeClick(committee.name)}
                      >
                        {committee.name}
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
              {bill.subjects.legislativeSubjects.map((subject, index) => (
                <Text key={index} fontSize="md">
                  • {subject.name}
                </Text>
              ))}
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
                defaultValue={bill.textVersions.list[0]?.type}
              >
                {bill.textVersions.list.map((version) => (
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
                    <Text>{bill.summaries.list[0]?.text || 'No summary available'}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Status</Heading>
                    <Text>{bill.latestAction.text}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Sponsors</Heading>
                    <Text>
                      {bill.sponsors.map(sponsor => sponsor.fullName).join(', ')}
                    </Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Committees</Heading>
                    <Text>
                      {bill.committees.list.map(committee => committee.name).join(', ')}
                    </Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Timeline</Heading>
                    <Timeline timeline={bill.actions.list.map(action => ({
                      date: action.actionDate,
                      milestone: action.text
                    }))} />
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
                <Box borderLeft="2px" borderColor="gray.200" h="100%" />
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
                {bill.textVersions.list[0]?.formats[0]?.url ? (
                  <Text>Full bill text available at: {bill.textVersions.list[0].formats[0].url}</Text>
                ) : (
                  "Full bill text not available"
                )}
              </Box>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BillSummary; 