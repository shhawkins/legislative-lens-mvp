import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { Bill } from '../../types/bill';
import { Committee } from '../../types/committee';
import Timeline from './Timeline';
import CommitteeModal from '../committee/CommitteeModal';

interface BillSummaryProps {
  bill: Bill;
}

/**
 * BillSummary component displays a comprehensive overview of a bill,
 * including its title, summary, status, sponsors, and committees.
 * It also provides access to the full bill text and committee information.
 * 
 * @param {BillSummaryProps} props - Component props
 * @param {Bill} props.bill - The bill data to display
 * @returns {JSX.Element} Bill summary component
 */
const BillSummary: React.FC<BillSummaryProps> = ({ bill }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isCommitteeOpen, onOpen: onCommitteeOpen, onClose: onCommitteeClose } = useDisclosure();
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);

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
                    <Timeline timeline={bill.timeline} />
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
                {bill.textVersions[0]?.text || "Full bill text not available"}
              </Box>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BillSummary; 