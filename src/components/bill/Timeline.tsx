import React from 'react';
import { Box, Divider, Flex, Text } from '@chakra-ui/react';

interface TimelineEvent {
  date: string;
  text: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

/**
 * Timeline component displays the chronological progression of a bill's journey
 * through the legislative process. Each event is represented by a dot and line,
 * with the date and milestone description.
 * 
 * @param {TimelineProps} props - Component props
 * @param {TimelineEvent[]} props.events - Array of timeline events for the bill
 * @returns {JSX.Element} Timeline visualization component
 */
const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <Flex direction="column" gap={4}>
      {events.map((event, index) => (
        <Flex key={index} align="center">
          <Box position="relative" mr={4}>
            <Box w="12px" h="12px" bg="blue.500" borderRadius="full" />
            {index < events.length - 1 && (
              <Divider orientation="vertical" position="absolute" top="12px" left="5px" h="calc(100% + 16px)" />
            )}
          </Box>
          <Box>
            <Text fontWeight="bold">{event.date}</Text>
            <Text>{event.text}</Text>
          </Box>
        </Flex>
      ))}
    </Flex>
  );
};

export default Timeline; 