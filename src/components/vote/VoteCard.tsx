import React from 'react';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
  HStack,
  Progress,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Divider,
} from '@chakra-ui/react';

interface VoteCardProps {
  vote: {
    congress: number;
    chamber: string;
    rollCall: number;
    date: string;
    question: string;
    result: string;
    billId: string;
    totalYes: number;
    totalNo: number;
    totalPresent: number;
    totalNotVoting: number;
    voteBreakdown: {
      democratic: {
        yes: number;
        no: number;
        present: number;
        notVoting: number;
      };
      republican: {
        yes: number;
        no: number;
        present: number;
        notVoting: number;
      };
    };
  };
}

const VoteCard: React.FC<VoteCardProps> = ({ vote }) => {
  const total = vote.totalYes + vote.totalNo + vote.totalPresent + vote.totalNotVoting;
  const yesPercentage = (vote.totalYes / total) * 100;
  const noPercentage = (vote.totalNo / total) * 100;

  return (
    <Card>
      <CardHeader>
        <VStack align="stretch" spacing={2}>
          <Heading size="md">{vote.question}</Heading>
          <HStack spacing={4}>
            <Badge colorScheme={vote.result === 'Passed' ? 'green' : 'red'}>
              {vote.result}
            </Badge>
            <Badge colorScheme="purple">
              {vote.chamber.charAt(0).toUpperCase() + vote.chamber.slice(1)} Vote #{vote.rollCall}
            </Badge>
            <Text color="gray.500" fontSize="sm">
              {new Date(vote.date).toLocaleDateString()}
            </Text>
          </HStack>
        </VStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={6} align="stretch">
          {/* Overall Results */}
          <Box>
            <Text fontWeight="bold" mb={2}>Vote Results</Text>
            <Progress
              value={yesPercentage}
              colorScheme="green"
              bg="red.100"
              height="24px"
              borderRadius="md"
            />
            <HStack justify="space-between" mt={1}>
              <Text color="green.500">Yea: {vote.totalYes} ({yesPercentage.toFixed(1)}%)</Text>
              <Text color="red.500">Nay: {vote.totalNo} ({noPercentage.toFixed(1)}%)</Text>
            </HStack>
          </Box>

          <Divider />

          {/* Party Breakdown */}
          <Box>
            <Text fontWeight="bold" mb={4}>Party Breakdown</Text>
            <HStack spacing={8} align="flex-start">
              {/* Democratic Votes */}
              <Box flex={1}>
                <Heading size="sm" color="blue.500" mb={2}>Democratic</Heading>
                <StatGroup>
                  <Stat>
                    <StatLabel>Yea</StatLabel>
                    <StatNumber>{vote.voteBreakdown.democratic.yes}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Nay</StatLabel>
                    <StatNumber>{vote.voteBreakdown.democratic.no}</StatNumber>
                  </Stat>
                </StatGroup>
              </Box>

              {/* Republican Votes */}
              <Box flex={1}>
                <Heading size="sm" color="red.500" mb={2}>Republican</Heading>
                <StatGroup>
                  <Stat>
                    <StatLabel>Yea</StatLabel>
                    <StatNumber>{vote.voteBreakdown.republican.yes}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Nay</StatLabel>
                    <StatNumber>{vote.voteBreakdown.republican.no}</StatNumber>
                  </Stat>
                </StatGroup>
              </Box>
            </HStack>
          </Box>

          {/* Other Votes */}
          <Box>
            <Text fontWeight="bold" mb={2}>Other</Text>
            <HStack spacing={4}>
              <Badge>Present: {vote.totalPresent}</Badge>
              <Badge>Not Voting: {vote.totalNotVoting}</Badge>
            </HStack>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default VoteCard; 