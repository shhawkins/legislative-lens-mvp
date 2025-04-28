# MVP Plan: Legislative Lens Frontend (Static Data)

## Objective
Deliver a working, polished React frontend for Legislative Lens using only static dummy data, ready for demo or handoff.

## Current Status
- [x] Core Layout Complete
  - [x] Two-panel desktop layout with divider
  - [x] Mobile-responsive collapsible sections
  - [x] Header with search functionality
  - [x] Footer structure in place

- [x] Search Modal
  - [x] Member search working
  - [x] Bill search working
  - [x] Committee search working with enhanced display
  - [ ] Result count updates with search (dynamic count as you type)
  - [x] Basic result display

- [ ] Committee Data Enhancement
  - [x] Added committee names and descriptions
  - [x] Added jurisdiction information
  - [x] Added member assignments and roles
  - [x] Added meeting information
  - [x] Added recent activity tracking
  - [x] Updated committee modal with new tabs
  - [ ] Add Congress number to committee cards
  - [ ] Complete missing committee data

- [x] Data Structure & Service Layer
  - [x] Removed unnecessary files and scripts
  - [x] Enhanced committees.json with complete structure
  - [x] Created comprehensive bill and vote type definitions
  - [x] Updated staticDataService to handle voting data
  - [x] Integrated timeline and status tracking

- [ ] Bill Details Enhancement
  - [x] Two-column layout implementation
  - [x] Timeline visualization on left panel
  - [x] Committee information on left panel
  - [x] Bill summary on right panel
  - [ ] Full bill text panel implementation
  - [x] Fix full text modal scrolling
  - [x] Simple click on recent bill to load modal

- [ ] Interactive features implementation
  - [x] Bill pinning functionality
  - [x] Committee member linking
  - [x] State selection on map
  - [ ] Map data integration
  - [ ] State modal consistency
  - [x] Map state coloring (static map coloring and interactivity working)
  - [ ] Fix pin and close icon spacing
  - [ ] Remove zip code functionality

- [ ] State management implementation
  - [ ] Context setup for global state
  - [ ] Reducers for bill management
  - [ ] Reducers for member management
  - [ ] Local storage integration

- [ ] Improvements to Member Card
  - [x] Show member photo with fallback
  - [x] Display party affiliation
  - [x] Committee assignments
  - [ ] Term history visualization
  - [ ] Age display
  - [ ] House/Senate designation
  - [ ] Fix state modal icon positions
  - [ ] Improve member card modal data loading
  - [ ] Auto-load random member on page refresh
  - [ ] Add refresh button for random member
  - [ ] Fix Congress.gov links in modals
  - [ ] Add fixed view on Congress.gov links
  - [ ] Match modal styling to main member page

## Next Steps
- [ ] Complete data enhancement
  - [x] Add timeline data to bills
  - [x] Add contact info to members
  - [x] Add district data for map visualization
  - [ ] Add age and term history data
  - [x] Add voting records and statistics

- [ ] Implement remaining core features
  - [x] Timeline visualization
    - [x] Basic milestone display
    - [x] Committee activity integration
    - [x] Visual indicators for events
    - [x] Static vote result display
  - [x] Map vote coloring
    - [x] Basic state coloring (static, matches 2024 results)
    - [ ] Dynamic vote result display
  - [ ] Member profile improvements
    - [x] Photo integration
    - [ ] Voting record visualization
    - [ ] Committee role history
    - [ ] Term history visualization
    - [ ] Age display
  - [ ] Committee detail enhancements
    - [x] Member list with roles
    - [x] Recent activities
    - [ ] Voting record integration
    - [ ] Congress number display

- [ ] State Modal Enhancements
  - [ ] Show member counts (All Members, Senators, Representatives)
  - [ ] Add Senate/House designation
  - [ ] Change "i" button to "View Full Profile"
  - [ ] Add state name to delegation header
  - [ ] Fix Congress.gov links

- [ ] Mobile optimization
  - [x] Responsive navigation
  - [x] Collapsible sections
  - [ ] Touch-friendly interactions
  - [ ] Performance optimization
  - [ ] Gesture controls

- [ ] Polish and finalize
  - [x] Error states
  - [x] Loading indicators
  - [ ] Performance optimization
  - [ ] Documentation update
  - [ ] Accessibility improvements
  - [ ] Code cleanup

## Success Criteria
- [x] Search modal renders with static data
- [ ] Committee data structure complete
- [x] Bill type definitions complete
- [x] Bill timeline data structure ready
- [ ] Member profile data structure ready
- [ ] Map visualization data ready
- [ ] Interactive features functional
- [ ] Mobile responsive design complete
  - [x] Components optimized for mobile
  - [x] Smooth navigation
  - [ ] Touch-friendly interactions
  - [ ] Efficient data loading
- [ ] Documentation updated

## Implementation Priority
1. [x] Static Timeline Implementation
   - [x] Create basic timeline component
   - [x] Integrate committee activities
   - [x] Add static vote results
   - [x] Implement basic filtering
   - [x] Design for future dynamic data

2. [ ] Member Profile Enhancement
  - [x] Basic profile display
  - [x] Committee assignments
  - [ ] Voting statistics
  - [ ] Term history
  - [ ] Age display
  - [ ] House/Senate designation
  - [ ] Auto-load random member
  - [ ] Add refresh button
  - [ ] Fix Congress.gov links

3. [ ] Committee Integration
  - [x] Display recent activities
  - [x] Show member assignments
  - [x] Link to relevant bills
  - [ ] Add Congress number
  - [ ] Complete missing data

4. [ ] State Modal and Map Integration
  - [ ] Show member counts
  - [ ] Add Senate/House designation
  - [ ] Fix state name display
  - [ ] Update Congress.gov links
  - [ ] Remove zip code functionality

5. [ ] Polish and Documentation
  - [x] Loading states
  - [x] Error handling
  - [ ] Performance optimization
  - [ ] Documentation updates
  - [ ] Code cleanup 