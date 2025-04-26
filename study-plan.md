# Legislative Lens Study Plan

## Codebase Overview

### Core Components
1. **App.tsx**
   - Main application component
   - Handles state management and routing
   - Contains mock data for development
   - Implements responsive layout logic

2. **EnhancedMap.tsx**
   - Interactive U.S. map visualization
   - Features:
     - State selection
     - Vote color gradients
     - Tooltips
     - Zoom/pan controls
     - Home state highlighting

3. **MemberCard.tsx**
   - Displays member information
   - Tabs for different data views:
     - Committees
     - Voting Record
     - Biography
   - Photo handling with fallback

4. **BillSummary.tsx**
   - Displays bill information
   - Committee integration
   - Timeline visualization
   - Voting records

5. **SearchModal.tsx**
   - Search functionality
   - Tabbed interface for different entities
   - Loading states
   - Mock search results

### Data Types
1. **Member**
   - Basic info (name, state, party)
   - Committees
   - Voting record
   - Contact info
   - Reelection date
   - Photo/depiction

2. **Bill**
   - Basic info (title, number, status)
   - Timeline events
   - Votes
   - Committees
   - Text versions

3. **Committee**
   - Basic info (name, chamber)
   - Members
   - Subcommittees
   - Meetings
   - Reports

## Study Plan

### Week 1: Core Components
1. **Day 1-2: App Structure**
   - Study App.tsx organization
   - Understand state management
   - Review responsive layout implementation
   - Practice: Create a simplified version

2. **Day 3-4: Map Component**
   - Study EnhancedMap.tsx
   - Understand map interactions
   - Review state selection logic
   - Practice: Create a basic map with state selection

3. **Day 5: Member Components**
   - Study MemberCard.tsx
   - Understand tab system
   - Review photo handling
   - Practice: Create a simplified member card

### Week 2: Data and Types
1. **Day 1-2: Type System**
   - Study type definitions
   - Understand interfaces
   - Review type usage in components
   - Practice: Create new types for features

2. **Day 3-4: Data Flow**
   - Study mock data structure
   - Understand data transformations
   - Review API integration points
   - Practice: Create mock data for new features

3. **Day 5: Component Integration**
   - Study component interactions
   - Understand prop passing
   - Review state updates
   - Practice: Connect components

### Week 3: Advanced Features
1. **Day 1-2: Search System**
   - Study SearchModal.tsx
   - Understand search logic
   - Review filtering system
   - Practice: Implement new search features

2. **Day 3-4: UI/UX**
   - Study Chakra UI implementation
   - Understand responsive design
   - Review accessibility features
   - Practice: Create new UI components

3. **Day 5: Testing**
   - Study testing setup
   - Understand test cases
   - Review test coverage
   - Practice: Write new tests

## Recent Changes
1. Fixed DOM nesting warning in MemberCard biography panel
2. Updated type definitions for Member, Committee, and Bill interfaces
3. Improved component organization
4. Enhanced error handling

## Next Steps
1. Complete component extraction
2. Implement proper testing
3. Add comprehensive documentation
4. Set up state management
5. Prepare for API integration

## Tips for Learning
1. Start with App.tsx to understand the big picture
2. Use the mock data to experiment with components
3. Focus on one component at a time
4. Practice by creating simplified versions
5. Use TypeScript's type system to understand data flow
6. Experiment with Chakra UI components
7. Test components in isolation 