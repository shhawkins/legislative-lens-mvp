import React from 'react';
import { Icon, IconProps } from '@chakra-ui/react';

// A simple five-sided dice SVG icon
const DiceIcon: React.FC<IconProps> = (props) => (
  <Icon viewBox="0 0 24 24" fill="currentColor" {...props}>
    <polygon points="12,2 22,8 18,22 6,22 2,8" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="7.5" r="1.2" />
    <circle cx="7.5" cy="12" r="1.2" />
    <circle cx="16.5" cy="12" r="1.2" />
    <circle cx="9" cy="17" r="1.2" />
    <circle cx="15" cy="17" r="1.2" />
  </Icon>
);

export default DiceIcon; 