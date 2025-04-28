import React, { useRef } from 'react';
import { Card, CardBody, Heading, Text, Button, Box, Flex, Badge, IconButton, useToast } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { Bill } from '../../types/bill';

interface BillCardProps {
  bill: Bill;
  onViewDetails?: (bill: Bill) => void;
  isPinned?: boolean;
  onTogglePin?: (bill: Bill) => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onViewDetails, isPinned, onTogglePin }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const handleTogglePin = (e: React.MouseEvent, bill: Bill) => {
    e.stopPropagation();
    if (onTogglePin) {
      onTogglePin(bill);
      toast({
        title: isPinned ? 'Bill unpinned' : 'Bill pinned',
        description: isPinned ? `${bill.title} has been removed from pinned bills` : `${bill.title} has been added to pinned bills`,
        status: isPinned ? 'info' : 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
    }
  };

  return (
    <Card
      ref={cardRef}
      variant="outline"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      position="relative"
      minH="100px"
    >
      <CardBody>
        <Flex align="center" mb={2}>
          <IconButton
            icon={<StarIcon />}
            aria-label={isPinned ? 'Unpin Bill' : 'Pin Bill'}
            colorScheme={isPinned ? 'yellow' : 'gray'}
            variant={isPinned ? 'solid' : 'ghost'}
            size="sm"
            mr={2}
            onClick={e => handleTogglePin(e, bill)}
          />
          <Heading size="sm">
            {bill.title}
          </Heading>
        </Flex>
        <Text fontSize="sm" color="gray.600" noOfLines={2}>
          {(bill.summary || '').replace(/<[^>]+>/g, '')}
        </Text>
        {onViewDetails && (
          <Button mt={3} size="sm" colorScheme="blue" onClick={e => { e.stopPropagation(); onViewDetails(bill); }}>
            View Full Details
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default BillCard; 