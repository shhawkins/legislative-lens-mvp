import React, { useEffect, useState } from 'react';
import { Box, VStack, Text, Heading, Spinner, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import congressApi from '../../services/congressApi';

const ApiTest: React.FC = () => {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const response = await congressApi.getBills();
        console.log('API Response:', response); // For debugging
        setBills(response.bills || []);
        setLoading(false);
      } catch (err) {
        console.error('API Error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchBills();
  }, []);

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
    <Box p={4}>
      <Accordion allowToggle defaultIndex={[]}>
        <AccordionItem>
          <AccordionButton>
            <Heading size="lg" flex="1" textAlign="left">Recent Bills</Heading>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack gap={4} alignItems="stretch">
              {bills.map((bill: any) => (
                <Box key={bill.number} p={4} bg="white" shadow="md" borderRadius="md">
                  <Heading size="md">{bill.title}</Heading>
                  <Text mt={2} color="gray.600">Bill Number: {bill.number}</Text>
                  <Text color="gray.600">Congress: {bill.congress}</Text>
                </Box>
              ))}
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default ApiTest; 