import React, { useRef } from 'react';
import { Card, CardBody, Heading, Text, Button, Box, Flex, Badge, IconButton } from '@chakra-ui/react';
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

  return (
    <Card
      ref={cardRef}
      variant="outline"
      _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      position="relative"
      minH="100px"
    >
      {/* Pin icon button */}
      <IconButton
        icon={<StarIcon />}
        aria-label={isPinned ? 'Unpin Bill' : 'Pin Bill'}
        colorScheme={isPinned ? 'yellow' : 'gray'}
        variant={isPinned ? 'solid' : 'ghost'}
        size="sm"
        position="absolute"
        top={3}
        right={3}
        zIndex={2}
        onClick={e => {
          e.stopPropagation();
          if (onTogglePin) onTogglePin(bill);
        }}
      />
      <CardBody>
        <Heading size="sm" mb={2}>
          {bill.title}
        </Heading>
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