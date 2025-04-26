import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { BillTimelineEvent } from '../../types/bill';

interface TimelineProps {
  timeline: BillTimelineEvent[];
}

/**
 * Timeline component displays the chronological progression of a bill's journey
 * through the legislative process. Each event is represented by a dot and line,
 * with the date and milestone description.
 * 
 * @param {TimelineProps} props - Component props
 * @param {BillTimelineEvent[]} props.timeline - Array of timeline events for the bill
 * @returns {JSX.Element} Timeline visualization component
 */
const Timeline: React.FC<TimelineProps> = React.memo(({ timeline }) => (
  <Box position="relative" p={4}>
    {timeline.map((event, index) => (
      <Flex key={index} position="relative" mb={6}>
        {/* Timeline dot and line */}
        <Box position="absolute" left={0} top={0}>
          <Box
            w="16px"
            h="16px"
            bg="blue.500"
            borderRadius="full"
            border="2px solid white"
            boxShadow="md"
          />
          {index < timeline.length - 1 && (
            <Box
              position="absolute"
              left="7px"
              top="16px"
              w="2px"
              h="calc(100% + 16px)"
              bg="blue.200"
            />
          )}
        </Box>
        
        {/* Content */}
        <Box ml={8}>
          <Text
            fontSize="sm"
            color="gray.500"
            fontWeight="medium"
          >
            {event.date}
          </Text>
          <Text
            fontSize="md"
            fontWeight="semibold"
            color="gray.700"
            mt={1}
          >
            {event.milestone}
          </Text>
        </Box>
      </Flex>
    ))}
  </Box>
));

Timeline.displayName = 'Timeline';

export default Timeline; 