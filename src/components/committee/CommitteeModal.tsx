import React from 'react';
import {
  Badge,
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  Heading,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Committee } from '../../types/committee';

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
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs>
            <TabList>
              <Tab>Members</Tab>
              <Tab>Meetings</Tab>
              <Tab>Reports</Tab>
            </TabList>

            <TabPanels>
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
                                {member.title && (
                                  <Text fontSize="sm" color="gray.600">
                                    {member.title}
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
                  {committee.subcommittees.length > 0 && (
                    <Box>
                      <Heading size="md" mb={4}>Subcommittees</Heading>
                      <VStack spacing={4} align="stretch">
                        {committee.subcommittees.map((subcommittee) => (
                          <Card key={subcommittee.id} variant="outline">
                            <CardHeader>
                              <Heading size="sm">{subcommittee.name}</Heading>
                            </CardHeader>
                            <CardBody>
                              <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
                                {subcommittee.members.map((member) => (
                                  <Box key={member.id}>
                                    <Text fontSize="sm" fontWeight="medium">{member.name}</Text>
                                    <Text fontSize="xs" color={member.party === 'D' ? 'blue.500' : 'red.500'}>
                                      {member.party === 'D' ? 'Democrat' : 'Republican'} - {member.state}
                                    </Text>
                                    {member.title && (
                                      <Text fontSize="xs" color="gray.600">
                                        {member.title}
                                      </Text>
                                    )}
                                  </Box>
                                ))}
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
                              {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
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
                </VStack>
              </TabPanel>

              {/* Reports Panel */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {committee.reports?.map((report) => (
                    <Card key={report.id} variant="outline">
                      <CardBody>
                        <Heading size="sm" mb={2}>{report.title}</Heading>
                        <Text fontSize="sm" color="gray.600">
                          {report.reportNumber} • {new Date(report.date).toLocaleDateString()}
                        </Text>
                        <Link
                          href={report.url}
                          isExternal
                          color="blue.500"
                          mt={2}
                          display="inline-block"
                        >
                          View Report <ExternalLinkIcon mx="2px" />
                        </Link>
                      </CardBody>
                    </Card>
                  ))}
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