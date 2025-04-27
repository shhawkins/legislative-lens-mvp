import React, { useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  VStack,
  Box,
  Heading,
  Divider,
  Badge,
  Flex,
} from '@chakra-ui/react';

interface BillFullTextProps {
  billId: string;
  isOpen: boolean;
  onClose: () => void;
}

const BillFullText: React.FC<BillFullTextProps> = ({ billId, isOpen, onClose }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // This is dummy text for now. Eventually, this will be replaced with actual bill text from Congress.gov API
  const dummyBillText = `
SECTION 1. SHORT TITLE.
This Act may be cited as the "Example Legislative Act of 2024".

SECTION 2. FINDINGS.
Congress finds the following:
(1) The implementation of comprehensive legislation is vital for the continued growth and development of our nation.
(2) Transparency and accountability in government operations serve the public interest.
(3) Innovation and technological advancement must be balanced with public safety and security.

SECTION 3. DEFINITIONS.
In this Act:
(1) AGENCY.—The term "Agency" means any executive agency as defined under section 105 of title 5, United States Code.
(2) SECRETARY.—The term "Secretary" means the Secretary of the relevant Department.

SECTION 4. IMPLEMENTATION.
(a) IN GENERAL.—Not later than 180 days after the date of enactment of this Act, the Secretary shall—
    (1) establish guidelines for the implementation of this Act;
    (2) consult with relevant stakeholders; and
    (3) submit to Congress a report on the progress of implementation.

(b) REQUIREMENTS.—The guidelines established under subsection (a) shall—
    (1) promote transparency;
    (2) ensure accountability; and
    (3) protect public interests.

SECTION 5. ADDITIONAL PROVISIONS.
(a) FUNDING.—There are authorized to be appropriated such sums as may be necessary to carry out this Act.

(b) REPORTING REQUIREMENTS.—
    (1) INITIAL REPORT.—Not later than 90 days after the date of enactment of this Act, the Secretary shall submit to Congress a report on the initial steps taken to implement this Act.
    (2) ANNUAL REPORT.—Not later than 1 year after the date of enactment of this Act, and annually thereafter, the Secretary shall submit to Congress a report on—
        (A) the progress made in implementing this Act;
        (B) any challenges encountered in implementing this Act; and
        (C) recommendations for legislative or administrative action to improve the implementation of this Act.

SECTION 6. EFFECTIVE DATE.
This Act shall take effect on the date that is 180 days after the date of enactment of this Act.

SECTION 7. SUNSET PROVISION.
The provisions of this Act shall cease to have effect on the date that is 5 years after the date of enactment of this Act, unless reauthorized by Congress.

SECTION 8. SEVERABILITY.
If any provision of this Act, or the application thereof to any person or circumstance, is held invalid, the remainder of this Act, and the application of such provision to other persons or circumstances, shall not be affected thereby.

SECTION 9. CONSTRUCTION.
Nothing in this Act shall be construed to—
(1) preempt, supersede, or otherwise affect any other Federal or State law;
(2) affect the authority of any State or local government to establish or enforce any law or regulation relating to the subject matter of this Act; or
(3) create any right or benefit, substantive or procedural, enforceable at law or in equity by any party against the United States, its departments, agencies, or entities, its officers, employees, or agents, or any other person.`;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      isCentered
    >
      <ModalOverlay />
      <ModalContent 
        maxW="75%"
        maxH="85vh"
        h="85vh"
        display="flex"
        flexDirection="column"
      >
        <ModalHeader borderBottomWidth="1px" flex="0 0 auto">
          <VStack align="start" spacing={2}>
            <Heading size="lg">Full Bill Text</Heading>
            <Badge colorScheme="blue">{billId}</Badge>
          </VStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody
          flex="1"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          px={0}
          py={0}
        >
          <Box px={8} py={4} borderBottomWidth="1px" bg="gray.50">
            <Text fontSize="sm" color="gray.500">
              Note: This is a preview version. Full text will be retrieved from Congress.gov API in the future.
            </Text>
          </Box>
          
          <Box
            ref={scrollContainerRef}
            flex="1"
            overflowY="auto"
            px={8}
            py={6}
            onWheel={(e) => {
              e.stopPropagation();
            }}
            sx={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#cbd5e0',
                borderRadius: '4px',
                '&:hover': {
                  background: '#a0aec0',
                },
              },
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <Box
              fontFamily="mono"
              whiteSpace="pre-wrap"
              p={4}
              bg="white"
              borderRadius="md"
              fontSize="sm"
              border="1px solid"
              borderColor="gray.200"
            >
              {dummyBillText}
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BillFullText; 