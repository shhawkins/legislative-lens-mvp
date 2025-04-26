import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Grid,
  Box,
  Badge,
  Flex,
  Link,
  UnorderedList,
  ListItem
} from '@chakra-ui/react';
import { Committee, CommitteeMember, Meeting, Activity, Subcommittee } from '../../types/committee';
import { ExternalLinkIcon } from '@chakra-ui/icons';

interface CommitteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  committee: Committee;
}

/**
 * CommitteeModal component displays detailed information about a committee,
 * including its members, subcommittees, meetings, and reports.
 * 
 * @param {CommitteeModalProps} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {() => void} props.onClose - Function to close the modal
 * @param {Committee} props.committee - The committee data to display
 * @returns {JSX.Element} Committee modal component
 */
const CommitteeModal: React.FC<CommitteeModalProps> = ({ isOpen, onClose, committee }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{committee.name}</Heading>
          <Text fontSize="sm" color="gray.500">
            {committee.chamber.charAt(0).toUpperCase() + committee.chamber.slice(1)} Committee • {committee.congress}th Congress
          </Text>
          <Text fontSize="md" mt={2} color="gray.700">
            {committee.description}
          </Text>
          <Flex gap={2} mt={2}>
            <Badge colorScheme={committee.chamber === 'house' ? 'blue' : 'purple'}>
              {committee.chamber.charAt(0).toUpperCase() + committee.chamber.slice(1)}
            </Badge>
            <Badge colorScheme="gray">{committee.type}</Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs>
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Members</Tab>
              <Tab>Meetings</Tab>
              <Tab>Activity</Tab>
            </TabList>

            <TabPanels>
              {/* Overview Panel */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="md" mb={4}>Jurisdiction</Heading>
                    <UnorderedList spacing={2}>
                      {committee.jurisdiction?.map((item, index) => (
                        <ListItem key={index}>{item}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                  
                  <Box>
                    <Heading size="md" mb={4}>Leadership</Heading>
                    <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
                      {committee.members
                        .filter(member => member.role === 'Chair' || member.role === 'Ranking Member')
                        .map((leader) => (
                          <Card key={leader.id} variant="outline">
                            <CardBody>
                              <Heading size="sm">{leader.name}</Heading>
                              <Text fontSize="sm" color="gray.600">{leader.role}</Text>
                              <Text fontSize="sm" color={leader.party === 'D' ? 'blue.500' : 'red.500'}>
                                {leader.party === 'D' ? 'Democrat' : 'Republican'} - {leader.state}
                              </Text>
                            </CardBody>
                          </Card>
                        ))}
                    </Grid>
                  </Box>

                  <Box>
                    <Heading size="md" mb={4}>Contact Information</Heading>
                    <Link href={committee.url} isExternal color="blue.500">
                      Committee Website <ExternalLinkIcon mx="2px" />
                    </Link>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Members Panel */}
              <TabPanel>
                <VStack spacing={6} align="stretch">
                  {/* Committee Members */}
                  <Box>
                    <Heading size="md" mb={4}>Committee Members</Heading>
                    <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
                      {committee.members.map((member) => (
                        <Card key={member.id} variant="outline">
                          <CardBody>
                            <Flex gap={4}>
                              <Box>
                                <Heading size="sm">{member.name}</Heading>
                                <Text fontSize="sm" color={member.party === 'D' ? 'blue.500' : 'red.500'}>
                                  {member.party === 'D' ? 'Democrat' : 'Republican'} - {member.state}
                                </Text>
                                {member.role && (
                                  <Text fontSize="sm" color="gray.600">
                                    {member.role}
                                  </Text>
                                )}
                              </Box>
                            </Flex>
                          </CardBody>
                        </Card>
                      ))}
                    </Grid>
                  </Box>

                  {/* Subcommittees */}
                  {committee.subcommittees && committee.subcommittees.length > 0 && (
                    <Box>
                      <Heading size="md" mb={4}>Subcommittees</Heading>
                      <VStack spacing={4} align="stretch">
                        {committee.subcommittees.map((subcommittee) => (
                          <Card key={subcommittee.systemCode} variant="outline">
                            <CardHeader>
                              <Heading size="sm">{subcommittee.name}</Heading>
                            </CardHeader>
                            <CardBody>
                              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                                <Box>
                                  <Text fontSize="sm" fontWeight="medium">Chair</Text>
                                  <Text fontSize="sm">{subcommittee.chair}</Text>
                                </Box>
                                <Box>
                                  <Text fontSize="sm" fontWeight="medium">Ranking Member</Text>
                                  <Text fontSize="sm">{subcommittee.rankingMember}</Text>
                                </Box>
                              </Grid>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* Meetings Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {committee.meetings?.map((meeting) => (
                    <Card key={meeting.id} variant="outline">
                      <CardBody>
                        <Flex justify="space-between" align="start">
                          <Box>
                            <Heading size="sm" mb={2}>{meeting.title}</Heading>
                            <Text fontSize="sm" color="gray.600">
                              {new Date(meeting.date).toLocaleDateString()} at {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {meeting.location}
                            </Text>
                            <Text fontSize="sm" mt={2}>
                              {meeting.description}
                            </Text>
                          </Box>
                          <Badge
                            colorScheme={
                              meeting.status === 'scheduled' ? 'blue' :
                              meeting.status === 'completed' ? 'green' : 'red'
                            }
                          >
                            {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                          </Badge>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                  {(!committee.meetings || committee.meetings.length === 0) && (
                    <Text color="gray.500" textAlign="center">No upcoming meetings scheduled</Text>
                  )}
                </VStack>
              </TabPanel>

              {/* Activity Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {committee.recentActivity?.map((activity, index) => (
                    <Card key={index} variant="outline">
                      <CardBody>
                        <Flex justify="space-between" align="start">
                          <Box>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(activity.date).toLocaleDateString()}
                            </Text>
                            <Text fontSize="md" mt={1}>
                              {activity.description}
                            </Text>
                          </Box>
                          <Badge colorScheme={
                            activity.type === 'hearing' ? 'blue' :
                            activity.type === 'markup' ? 'green' :
                            activity.type === 'legislation' ? 'purple' : 'gray'
                          }>
                            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                          </Badge>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                  {(!committee.recentActivity || committee.recentActivity.length === 0) && (
                    <Text color="gray.500" textAlign="center">No recent activity</Text>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CommitteeModal; 