import React from 'react';
import {
  Box,
  Divider,
  Flex,
  Text,
  Badge,
  Icon,
  VStack,
  useColorModeValue,
  Circle
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, InfoIcon, TimeIcon } from '@chakra-ui/icons';
import { TimelineEvent } from '../../types/bill';

interface TimelineProps {
  events: TimelineEvent[];
  showDetails?: boolean;
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'complete':
      return CheckCircleIcon;
    case 'failed':
      return WarningIcon;
    case 'pending':
      return TimeIcon;
    default:
      return InfoIcon;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'complete':
      return 'green';
    case 'failed':
      return 'red';
    case 'pending':
      return 'yellow';
    default:
      return 'blue';
  }
};

const getEventTypeColor = (type?: string) => {
  switch (type) {
    case 'introduction':
      return 'purple';
    case 'committee':
      return 'orange';
    case 'vote':
      return 'cyan';
    default:
      return 'gray';
  }
};

/**
 * Timeline component displays the chronological progression of a bill's journey
 * through the legislative process. Each event is represented by a dot and line,
 * with the date and milestone description.
 * 
 * @param {TimelineProps} props - Component props
 * @param {TimelineEvent[]} props.events - Array of timeline events for the bill
 * @param {boolean} props.showDetails - Whether to show detailed information
 * @returns {JSX.Element} Timeline visualization component
 */
const Timeline: React.FC<TimelineProps> = ({ events, showDetails = false }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <VStack spacing={4} align="stretch">
      {events.map((event, index) => (
        <Flex key={index} gap={4}>
          <Box position="relative">
            <Circle
              size="12px"
              bg={event.status === 'complete' ? 'green.500' : event.status === 'pending' ? 'yellow.500' : 'gray.300'}
              position="relative"
              zIndex={1}
            />
            {index < events.length - 1 && (
              <Box
                position="absolute"
                left="5px"
                top="12px"
                bottom="-28px"
                width="2px"
                bg="gray.200"
              />
            )}
          </Box>
          <Box flex={1}>
            <Text fontWeight="bold">{event.title}</Text>
            <Text color="gray.600" fontSize="sm">
              {new Date(event.date).toLocaleDateString()}
            </Text>
            <Text mt={1}>{event.text}</Text>
            {showDetails && event.details && (
              <Box mt={2}>
                {event.details.actionBy && (
                  <Badge colorScheme="blue" mr={2}>
                    {event.details.actionBy}
                  </Badge>
                )}
                {event.details.committee && (
                  <Badge colorScheme="purple" mr={2}>
                    {event.details.committee}
                  </Badge>
                )}
                {event.details.outcome && (
                  <Badge colorScheme="green">
                    {event.details.outcome}
                  </Badge>
                )}
              </Box>
            )}
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};

export default Timeline; 