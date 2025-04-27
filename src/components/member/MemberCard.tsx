import React, { useState, useEffect } from 'react';
import { Box, Text, Image, VStack, HStack, Badge, Button, Link, Divider, Flex } from '@chakra-ui/react';
import { Member } from '../../types/member';
import { getMemberPhoto } from '../../services/imageProxy';
import { ExternalLinkIcon } from '@chakra-ui/icons';

interface MemberCardProps {
  member: Member;
  showDistrict?: boolean;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, showDistrict }) => {
  const [photoUrl, setPhotoUrl] = useState<string>('/default-member-photo.jpg');

  useEffect(() => {
    const loadPhoto = async () => {
      const url = await getMemberPhoto(member.bioguideId);
      setPhotoUrl(url);
    };
    loadPhoto();
  }, [member.bioguideId]);

  // Dummy data for all fields
  const mockCommittees = ["Judiciary", "Finance", "Energy and Commerce"];
  const mockContact = "rep.email@congress.gov";
  const mockNextElection = "2026-11-03";
  const mockVotes = [
    { billId: 'HR2399', vote: 'yes', title: 'Rural Broadband Protection Act of 2025' },
    { billId: 'HR1721', vote: 'no', title: 'Critical Infrastructure Manufacturing Feasibility Act' },
    { billId: 'HR906', vote: 'present', title: 'Foreign Adversary Communications Transparency Act' }
  ];
  const sponsoredCount = member.sponsoredLegislation?.count || 0;
  const cosponsoredCount = member.cosponsoredLegislation?.count || 0;
  const birthYear = member.birthYear || 'N/A';
  const partyLabel = member.party === 'D' ? 'Democrat' : member.party === 'R' ? 'Republican' : 'Independent';
  const partyColor = member.party === 'D' ? 'blue' : member.party === 'R' ? 'red' : 'gray';
  const chamberLabel = member.chamber ? member.chamber.charAt(0).toUpperCase() + member.chamber.slice(1) : 'N/A';

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      boxShadow="md"
      bg="white"
      maxW="400px"
      w="100%"
    >
      <VStack gap={4} align="stretch">
        <Flex gap={4} align="center">
          <Image
            src={photoUrl}
            alt={`${member.fullName}'s photo`}
            boxSize="100px"
            objectFit="cover"
            borderRadius="full"
            borderWidth="3px"
            borderColor={partyColor + '.500'}
          />
          <Box flex={1} minW={0}>
            <Text fontWeight="bold" fontSize="xl">{member.fullName}</Text>
            <HStack spacing={2} mt={1} mb={1}>
              <Badge colorScheme={partyColor}>{partyLabel}</Badge>
              <Badge colorScheme="purple">{chamberLabel}</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.500">
              {member.state}{showDistrict && member.district && `-${member.district}`} • {partyLabel} • {chamberLabel}
            </Text>
            <Text fontSize="sm" color="gray.500">Born: {birthYear}</Text>
            <Link href={`https://www.congress.gov/member/${member.firstName}-${member.lastName}/${member.bioguideId}`} isExternal>
              <Button size="xs" variant="ghost" colorScheme="blue" leftIcon={<ExternalLinkIcon />} mt={1}>
                View on Congress.gov
              </Button>
            </Link>
          </Box>
        </Flex>
        <Divider />
        <Box>
          <Text fontWeight="bold" mb={1}>Committee Assignments</Text>
          {mockCommittees.length > 0 ? (
            <VStack align="start" spacing={0}>
              {mockCommittees.map((c, i) => (
                <Text key={i} fontSize="sm">• {c}</Text>
              ))}
            </VStack>
          ) : (
            <Text color="gray.400">Not available</Text>
          )}
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>Contact Information</Text>
          <Text fontSize="sm">${member.firstName}.${member.lastName}@${member.chamber}.congrees.gov</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>Next Election</Text>
          <Text fontSize="sm">{mockNextElection}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>Recent Voting Record</Text>
          {mockVotes.length > 0 ? (
            <VStack align="start" spacing={0}>
              {mockVotes.map((vote, i) => (
                <Text key={i} fontSize="sm">
                  <Link href={`https://www.congress.gov/bill/119th-congress/house-bill/${vote.billId.substring(2)}`} isExternal color="blue.500">
                    {vote.title}
                  </Link>
                  : {vote.vote.toUpperCase()}
                </Text>
              ))}
            </VStack>
          ) : (
            <Text color="gray.400">Not available</Text>
          )}
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>Legislation</Text>
          <Text fontSize="sm">
            Sponsored: {sponsoredCount}{' '}
            <Link href={member.sponsoredLegislation?.url || '#'} isExternal color="blue.500" ml={2}>
              View
            </Link>
          </Text>
          <Text fontSize="sm">
            Co-sponsored: {cosponsoredCount}{' '}
            <Link href={member.cosponsoredLegislation?.url || '#'} isExternal color="blue.500" ml={2}>
              View
            </Link>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}; 