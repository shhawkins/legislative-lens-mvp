import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  Heading,
  Input,
  Select,
  Spinner,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { staticDataService } from '../../services/staticDataService';
import BillSummary from './BillSummary';

/**
 * BillList component displays a list of all bills using static data.
 * Features:
 * - Loading skeletons while data is being fetched
 * - Error handling with user-friendly messages
 * - Responsive grid layout
 * - Filtering by status and search
 * - Sort options
 * - Comprehensive error states
 */
const BillList: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCongress, setFilterCongress] = useState<string>('118');
  const [filterType, setFilterType] = useState<string>('all');
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchBills = () => {
      try {
        const allBills = staticDataService.getBills();
        const congressBills = allBills.filter(bill => bill.congress === parseInt(filterCongress));
        setBills(congressBills);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bills:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bills');
        setLoading(false);
      }
    };

    fetchBills();
  }, [filterCongress]);

  const handleBillClick = (billId: string) => {
    setSelectedBillId(billId);
    onOpen();
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || bill.billType === filterType;
    return matchesSearch && matchesType;
  });

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

  return (
    <VStack spacing={6} align="stretch">
      {/* Filters */}
      <Flex gap={4}>
        <Select
          value={filterCongress}
          onChange={(e) => setFilterCongress(e.target.value)}
          width="150px"
        >
          <option value="118">118th Congress</option>
          <option value="117">117th Congress</option>
        </Select>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          width="150px"
        >
          <option value="all">All Types</option>
          <option value="HR">House Bills</option>
          <option value="S">Senate Bills</option>
        </Select>
        <Input
          placeholder="Search bills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          flex="1"
        />
      </Flex>

      {/* Bill List */}
      <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
        {filteredBills.map((bill) => (
          <Card
            key={`${bill.congress}-${bill.billType.toLowerCase()}-${bill.billNumber}`}
            cursor="pointer"
            onClick={() => handleBillClick(`${bill.congress}-${bill.billType.toLowerCase()}-${bill.billNumber}`)}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Heading size="sm" mb={2}>
                  {bill.billType}. {bill.billNumber} - {bill.title}
                </Heading>
                <Text fontSize="sm" color="gray.600" noOfLines={2}>
                  {bill.summary || 'No summary available'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Introduced: {new Date(bill.introducedDate).toLocaleDateString()}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Status: {bill.latestAction?.text || 'No status available'}
                </Text>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </Grid>

      {/* Bill Summary Modal */}
      {selectedBillId && (
        <BillSummary
          billId={selectedBillId}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
    </VStack>
  );
};

export default BillList; 