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
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { staticDataService } from '../../services/staticDataService';
import BillSummary from './BillSummary';
import BillCard from './BillCard';
import { Bill } from '../../types/bill';

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
  const [pinnedBills, setPinnedBills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCongress, setFilterCongress] = useState<string>('118');
  const [filterType, setFilterType] = useState<string>('all');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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

  const handleTogglePin = (bill: Bill) => {
    const billId = `${bill.congress}-${bill.billType.toLowerCase()}-${bill.billNumber}`;
    setPinnedBills(current => {
      const isPinned = current.includes(billId);
      if (isPinned) {
        return current.filter(id => id !== billId);
      } else {
        return [...current, billId];
      }
    });
  };

  const isBillPinned = (bill: any) => {
    const billId = `${bill.congress}-${bill.billType.toLowerCase()}-${bill.billNumber}`;
    return pinnedBills.includes(billId);
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
          <BillCard
            key={`${bill.congress}-${bill.billType.toLowerCase()}-${bill.billNumber}`}
            bill={bill}
            isPinned={isBillPinned(bill)}
            onTogglePin={handleTogglePin}
            onViewDetails={() => handleBillClick(`${bill.congress}-${bill.billType.toLowerCase()}-${bill.billNumber}`)}
          />
        ))}
      </Grid>

      {/* Bill Summary Modal */}
      {selectedBillId && (
        <BillSummary
          billId={selectedBillId}
          isOpen={isOpen}
          onClose={onClose}
          isPinned={selectedBillId ? pinnedBills.includes(selectedBillId) : false}
          onTogglePin={() => {
            if (selectedBillId) {
              setPinnedBills(current => {
                const isPinned = current.includes(selectedBillId);
                if (isPinned) {
                  return current.filter(id => id !== selectedBillId);
                } else {
                  return [...current, selectedBillId];
                }
              });
            }
          }}
        />
      )}
    </VStack>
  );
};

export default BillList; 