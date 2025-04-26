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
  Badge,
  Skeleton,
  Alert,
  AlertIcon,
  IconButton,
} from '@chakra-ui/react';
import { staticDataService } from '../../services/staticDataService';
import Timeline from './Timeline';
import CommitteeModal from '../committee/CommitteeModal';
import { Bill, Vote } from '../../types/bill';
import { StarIcon } from '@chakra-ui/icons';

interface BillSummaryProps {
  billId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectMember?: (member: any) => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

type CommitteeItem = NonNullable<Bill['committees']['items'][number]>;

const CommitteeDisplay: React.FC<{ committee: CommitteeItem }> = ({ committee }) => (
  <Box>
    <Text>{committee.name}</Text>
    <Text fontSize="sm" color="gray.600">
      {committee.activities.map(a => a.name).join(', ')}
    </Text>
  </Box>
);

function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
}

/**
 * BillSummary component displays a comprehensive overview of a bill,
 * including its title, summary, status, sponsors, and committees.
 * It also provides access to the full bill text and committee information.
 * 
 * @param {BillSummaryProps} props - Component props
 * @param {string} props.billId - The bill ID in format "congress-type-number" (e.g., "118-hr-1234")
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {() => void} props.onClose - Callback to close the modal
 * @param {() => void} props.onSelectMember - Callback to select a member
 * @param {boolean} props.isPinned - Whether the bill is pinned
 * @param {() => void} props.onTogglePin - Callback to toggle the pinned state
 * @returns {JSX.Element} Bill summary component
 */
const BillSummary: React.FC<BillSummaryProps> = ({ billId, isOpen, onClose, onSelectMember, isPinned, onTogglePin }) => {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOpen: isCommitteeOpen, onOpen: onCommitteeOpen, onClose: onCommitteeClose } = useDisclosure();
  const [selectedCommittee, setSelectedCommittee] = useState<any | null>(null);

  useEffect(() => {
    const fetchBill = async () => {
      setLoading(true);
      setError(null);
      try {
        // Format should be "HR1234" or "S1234"
        const rawBill = staticDataService.getBillById(billId);
        if (!rawBill) {
          setError('Bill not found');
          return;
        }

        // Ensure required fields are present
        const committees = rawBill.committees || {
          count: 0,
          items: []
        };

        const votes: Vote = rawBill.votes || {
          committee: undefined,
          house: undefined,
          senate: undefined
        };

        // Extract action details
        const actionDetails = rawBill.latestAction?.text
          ? rawBill.latestAction.text
              .split(' by ')
              .slice(1)
              .join(' by ')
              .split('.')
              .filter(Boolean)[0]
          : '';

        // Transform raw bill into Bill type with required fields
        const transformedBill: Bill = {
          ...rawBill,
          committees,
          votes,
          timeline: {
            milestones: [
              {
                date: rawBill.introducedDate,
                title: 'Introduced',
                description: `Introduced by ${rawBill.sponsor.fullName}`,
                status: 'complete' as const,
                details: {
                  actionBy: rawBill.sponsor.fullName
                }
              },
              ...(rawBill.latestAction ? [{
                date: rawBill.latestAction.actionDate,
                title: 'Latest Action',
                description: rawBill.latestAction.text,
                status: 'complete' as const,
                details: {
                  actionBy: actionDetails || undefined
                }
              }] : [])
            ]
          },
          status: {
            current: rawBill.latestAction?.text || 'Introduced',
            stage: rawBill.latestAction?.text || 'Introduced',
            isActive: true,
            lastUpdated: rawBill.latestAction?.actionDate || rawBill.introducedDate
          }
        };
        setBill(transformedBill);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bill details');
        setLoading(false);
      }
    };

    if (billId) {
      fetchBill();
    }
  }, [billId]);

  const handleCommitteeClick = (committeeName: string) => {
    const committee = staticDataService.getCommittees().find(c => c.name === committeeName);
    if (committee) {
      setSelectedCommittee(committee);
      onCommitteeOpen();
    }
  };

  if (!isOpen) return null;

  const renderHeader = () => {
    if (loading) {
      return <Skeleton height="30px" width="80%" />;
    }
    if (error) {
      return <Heading size="lg">Error Loading Bill</Heading>;
    }
    if (!bill) {
      return null;
    }
    return (
      <VStack align="start" spacing={2} position="relative" w="100%">
        <Flex align="center" w="100%">
          <Heading size="lg" flex="1">{bill.title}</Heading>
          {typeof isPinned !== 'undefined' && onTogglePin && (
            <IconButton
              icon={<StarIcon />}
              aria-label={isPinned ? 'Unpin Bill' : 'Pin Bill'}
              colorScheme={isPinned ? 'yellow' : 'gray'}
              variant={isPinned ? 'solid' : 'ghost'}
              size="sm"
              ml={4}
              mt={1}
              onClick={onTogglePin}
            />
          )}
        </Flex>
        <HStack spacing={2}>
          <Badge colorScheme="blue">{bill.billType} {bill.billNumber}</Badge>
          <Badge colorScheme={bill.status.isActive ? 'green' : 'gray'}>
            {bill.status.current}
          </Badge>
        </HStack>
      </VStack>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <VStack spacing={4} align="stretch">
          <Skeleton height="100px" />
          <Skeleton height="60px" />
          <Skeleton height="80px" />
        </VStack>
      );
    }
    if (error) {
      return (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      );
    }
    if (!bill) {
      return <Text color="gray.500">No bill details available</Text>;
    }
    return (
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="sm" color="gray.500">Summary</Text>
          <Text mt={1}>{stripHtmlTags(bill.summary || '') || 'No summary available'}</Text>
        </Box>
        
        <Box>
          <Text fontSize="sm" color="gray.500">Sponsor</Text>
          {bill.sponsor ? (
            <Text mt={1}>
              {onSelectMember ? (
                <Box
                  as="button"
                  color="blue.600"
                  fontWeight="semibold"
                  cursor="pointer"
                  _hover={{ textDecoration: 'underline' }}
                  onClick={() => { onSelectMember(bill.sponsor); onClose(); }}
                  display="inline"
                  background="none"
                  border="none"
                  p={0}
                >
                  {bill.sponsor.fullName}
                </Box>
              ) : (
                bill.sponsor.fullName
              )}
            </Text>
          ) : (
            <Text mt={1}>Not available</Text>
          )}
          <Text fontSize="sm" color="gray.600">
            {bill.sponsor.party === 'D' ? 'Democrat' : 'Republican'} - {bill.sponsor.state}
          </Text>
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Latest Action</Text>
          {bill.latestAction && (
            <>
              <Text mt={1}>{bill.latestAction.text}</Text>
              <Text fontSize="sm" color="gray.600">
                {new Date(bill.latestAction.actionDate).toLocaleDateString()}
              </Text>
            </>
          )}
        </Box>

        <Box>
          <Text fontSize="sm" color="gray.500">Committees</Text>
          <VStack mt={1} align="stretch" spacing={2}>
            {bill.committees.items.map((committee, index) => (
              <Box key={index}>
                <CommitteeDisplay committee={committee} />
              </Box>
            ))}
            {bill.committees.items.length === 0 && (
              <Text color="gray.500">No committees assigned</Text>
            )}
          </VStack>
        </Box>

        {bill.votes && (
          <Box>
            <Text fontSize="sm" color="gray.500">Votes</Text>
            <VStack mt={1} align="stretch" spacing={2}>
              {bill.votes.committee && (
                <Box>
                  <Text fontWeight="medium">Committee Vote</Text>
                  <Text fontSize="sm">
                    Yea: {bill.votes.committee.total.yea} | 
                    Nay: {bill.votes.committee.total.nay} | 
                    Present: {bill.votes.committee.total.present}
                  </Text>
                </Box>
              )}
              {bill.votes.house && (
                <Box>
                  <Text fontWeight="medium">House Vote</Text>
                  <Text fontSize="sm">
                    Yea: {bill.votes.house.total.yea} | 
                    Nay: {bill.votes.house.total.nay} | 
                    Present: {bill.votes.house.total.present}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    );
  };

  return (
    <>
      <VStack spacing={6} align="stretch">
        {/* Top Panel - Bill Summary */}
        <HStack spacing={6} align="stretch">
          <Box flex="1">
            <Card>
              <CardHeader>
                <Heading size="md">{bill?.title}</Heading>
              </CardHeader>
              <CardBody>
                <Text fontSize="md" lineHeight="tall">
                  {stripHtmlTags(bill?.summary || '') || 'No summary available'}
                </Text>
                <Text mt={4}><strong>Status:</strong> {bill?.latestAction?.text || 'No status available'}</Text>
                <Text>
                  <strong>Sponsor:</strong>{' '}
                  {bill?.sponsor.fullName}
                </Text>
                <Text>
                  <strong>Committee:</strong>{' '}
                  <Box
                    as="span"
                    color="blue.500"
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                    onClick={() => handleCommitteeClick(bill?.latestAction?.text.split('Committee on ')[1]?.split('.')[0] || '')}
                  >
                    {bill?.latestAction?.text.split('Committee on ')[1]?.split('.')[0] || 'Unknown Committee'}
                  </Box>
                </Text>
                <Button mt={4} onClick={onClose}>View Full Details</Button>
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
              <Text fontSize="md">• Policy Area: {bill?.policyArea?.name}</Text>
              <Text fontSize="md">• Introduced: {new Date(bill?.introducedDate || '').toLocaleDateString()}</Text>
              <Text fontSize="md">• Latest Action: {bill?.latestAction?.text}</Text>
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
            {renderHeader()}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {renderBody()}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BillSummary; 