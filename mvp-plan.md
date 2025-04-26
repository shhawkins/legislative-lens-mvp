# MVP Plan: Legislative Lens Frontend (Static Data)

## Objective
Deliver a working, polished React frontend for Legislative Lens using only static dummy data, ready for demo or handoff in the next two hours.

## Guiding Principles
- Use only static data (no live API calls)
- Prioritize core user flows and UI polish
- Ensure all main features are visually represented
- Keep code and UI beginner-friendly and well-commented
- **LAYOUT AND DESIGN STAY EXACTLY THE SAME!**
- **We must adapt `src/original-app.tsx` to meet the requirements in `prompt.md`, updating `src/App.tsx` as our main file.**
- **Leave comprehensive comments suitable for beginner learners in all code changes.**
- **After each change, update `changelog.md` with a brief entry and unique ID.**

## Key Deliverables
- Home page/dashboard with navigation
- Bill list and bill summary views
- Member list and member profile views
- Committee list and committee detail modal
- Timeline visualization for bill progress
- Loading skeletons and error states for all major components
- Responsive design for desktop and mobile

## Step-by-Step Plan

### 1. Data Preparation (15 min)
- [x] Review and update static data files for bills, members, and committees in `src/data/`
- [x] Ensure data is realistic and covers all UI cases (empty, error, normal)
- [x] Add images/avatars for members and committees if possible

**Summary:**
- Added a `photo` field to each member in `members.json` (using placeholder images)
- Added an `image` field to each committee in `committees.json` (using a placeholder image)
- Added incomplete entries to each file to simulate error/empty states
- Data now supports normal, empty, and error UI cases, and includes images/avatars for a more polished UI

### 2. Static Data Service (10 min)
- [x] Ensure `staticDataService` provides easy access to all mock data
- [x] Add helper methods for fetching by ID, filtering, etc.

**Summary:**
- Added helper methods for filtering bills by sponsor, committee, and status; members by chamber, party, and committee; and committees by chamber
- Added comprehensive JSDoc comments for all methods
- Ensured all methods handle empty/error cases gracefully
- Made the code beginner-friendly with clear comments and type annotations

### 3. Core Component Wiring (30 min)
- [ ] Bill list page: display all bills from static data
- [ ] Bill summary page: show details, sponsor, committees, timeline
- [ ] Member list page: display all members from static data
- [ ] Member profile page: show details, sponsored bills, committees
- [ ] Committee list: show all committees, open modal for details
- [ ] Committee modal: show leadership, subcommittees, and details
- [ ] Timeline: visualize bill actions using static data

### 4. UI Polish & States (30 min)
- [ ] Add loading skeletons to all major components
- [ ] Add error and empty states (simulate with toggles or props)
- [ ] Ensure all modals, tabs, and navigation work smoothly
- [ ] Add tooltips, badges, and links for extra polish
- [ ] Ensure color mode (light/dark) support

### 5. Responsiveness & Accessibility (15 min)
- [ ] Test on mobile and desktop breakpoints
- [ ] Ensure keyboard navigation and focus states
- [ ] Add alt text for images/avatars
- [ ] Use semantic HTML and ARIA labels where needed

### 6. Documentation & Handoff (20 min)
- [ ] Add clear comments to all components for beginners
- [ ] Update README with quickstart and usage instructions
- [ ] List all static data files and their structure
- [ ] Document how to swap in real API later
- [ ] **Update `changelog.md` after each change with a brief entry and unique ID**

## Success Criteria
- [ ] All main pages and modals render with static data
- [ ] No runtime errors or TypeScript errors
- [ ] UI is visually polished and responsive
- [ ] All code is commented and beginner-friendly
- [ ] Changelog is up to date after each change
- [ ] Ready for demo or handoff in under 2 hours 