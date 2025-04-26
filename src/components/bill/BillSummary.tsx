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
  Text,
  VStack,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import { staticDataService } from '../../services/staticDataService';
import Timeline from './Timeline';
import CommitteeModal from '../committee/CommitteeModal';

interface BillSummaryProps {
  billId: string;
  isOpen?: boolean;
  onClose?: () => void;
}

/**
 * BillSummary component displays a comprehensive overview of a bill,
 * including its title, summary, status, sponsors, and committees.
 * It also provides access to the full bill text and committee information.
 * 
 * @param {BillSummaryProps} props - Component props
 * @param {string} props.billId - The bill ID in format "congress-type-number" (e.g., "118-hr-1234")
 * @param {boolean} [props.isOpen] - Whether the modal is open
 * @param {() => void} [props.onClose] - Callback to close the modal
 * @returns {JSX.Element} Bill summary component
 */
const BillSummary: React.FC<BillSummaryProps> = ({ billId, isOpen: externalIsOpen, onClose: externalOnClose }) => {
  const [bill, setBill] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: internalIsOpen, onOpen: internalOnOpen, onClose: internalOnClose } = useDisclosure();
  const { isOpen: isCommitteeOpen, onOpen: onCommitteeOpen, onClose: onCommitteeClose } = useDisclosure();
  const [selectedCommittee, setSelectedCommittee] = useState<any | null>(null);

  // Use external isOpen/onClose if provided, otherwise use internal state
  const isOpen = externalIsOpen ?? internalIsOpen;
  const onClose = externalOnClose ?? internalOnClose;

  useEffect(() => {
    const fetchBill = () => {
      try {
        const [congress, type, number] = billId.split('-');
        const bill = staticDataService.getBillById(parseInt(congress), type, parseInt(number));
        setBill(bill);
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
    const committee = staticDataService.getCommittees().find(c => c.name === committeeName);
    if (committee) {
      setSelectedCommittee(committee);
      onCommitteeOpen();
    }
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
                  {bill.summary || 'No summary available'}
                </Text>
                <Text mt={4}><strong>Status:</strong> {bill.status}</Text>
                <Text>
                  <strong>Sponsor:</strong>{' '}
                  {bill.sponsor.firstName} {bill.sponsor.lastName} ({bill.sponsor.party}-{bill.sponsor.state})
                </Text>
                <Text>
                  <strong>Committee:</strong>{' '}
                  <Box
                    as="span"
                    color="blue.500"
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={() => handleCommitteeClick(bill.latestAction.text.split('Committee on ')[1]?.split('.')[0] || '')}
                  >
                    {bill.latestAction.text.split('Committee on ')[1]?.split('.')[0] || 'Unknown Committee'}
                  </Box>
                </Text>
                <Button mt={4} onClick={internalOnOpen}>View Full Details</Button>
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
              <Text fontSize="md">• Policy Area: {bill.policyArea}</Text>
              <Text fontSize="md">• Introduced: {new Date(bill.introducedDate).toLocaleDateString()}</Text>
              <Text fontSize="md">• Latest Action: {bill.latestAction.text}</Text>
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
                    <Text>{bill.summary || 'No summary available'}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Status</Heading>
                    <Text>{bill.status}</Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Sponsor</Heading>
                    <Text>
                      {bill.sponsor.firstName} {bill.sponsor.lastName} ({bill.sponsor.party}-{bill.sponsor.state})
                    </Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Committee</Heading>
                    <Text>
                      {bill.latestAction.text.split('Committee on ')[1]?.split('.')[0] || 'Unknown Committee'}
                    </Text>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2}>Timeline</Heading>
                    <Timeline events={[
                      { date: bill.introducedDate, text: 'Introduced' },
                      { date: bill.latestAction.actionDate, text: bill.latestAction.text }
                    ]} />
                  </Box>
                </VStack>
              </Box>

              {/* Divider */}
              <Box 
                position="relative" 
                cursor="col-resize" 
                _hover={{ bg: "gray.100" }}
              />

              {/* Right Panel - Bill Text */}
              <Box overflowY="auto" pl={4}>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="sm" mb={2}>Bill Text</Heading>
                    <Text>
                      {bill.summary || 'No bill text available'}
                    </Text>
                  </Box>
                </VStack>
              </Box>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BillSummary; 