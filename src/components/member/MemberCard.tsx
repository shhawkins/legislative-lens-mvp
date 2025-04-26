import React, { useState, useEffect } from 'react';
import { Box, Text, Image, VStack, HStack, Badge } from '@chakra-ui/react';
import { Member } from '../../types/member';
import { getMemberPhoto } from '../../services/imageProxy';

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

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={4}
      boxShadow="md"
      _hover={{ boxShadow: 'lg' }}
    >
      <VStack gap={4} align="stretch">
        <HStack gap={4}>
          <Image
            src={photoUrl}
            alt={`${member.fullName}'s photo`}
            boxSize="100px"
            objectFit="cover"
            borderRadius="full"
          />
          <VStack align="start" gap={1}>
            <Text fontWeight="bold" fontSize="lg">{member.fullName}</Text>
            <Text>
              {member.state}
              {showDistrict && member.district && ` - District ${member.district}`}
            </Text>
            <Badge colorScheme={member.party === 'D' ? 'blue' : 'red'}>
              {member.party === 'D' ? 'Democrat' : 'Republican'}
            </Badge>
            <Badge colorScheme="purple">
              {member.chamber.charAt(0).toUpperCase() + member.chamber.slice(1)}
            </Badge>
          </VStack>
        </HStack>
        
        <Box>
          <Text fontWeight="bold">Committees:</Text>
          <Text>{member.committees.join(', ')}</Text>
        </Box>

        {member.contactInfo && (
          <Box>
            <Text fontWeight="bold">Contact:</Text>
            <Text>{member.contactInfo}</Text>
          </Box>
        )}

        {member.reelectionDate && (
          <Box>
            <Text fontWeight="bold">Reelection Date:</Text>
            <Text>{member.reelectionDate}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}; 