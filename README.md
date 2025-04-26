# Legislative Lens

A React application for exploring and analyzing legislative data from Congress.gov.

## Features

- View and search bills
- Track bill progress
- View member information
- Committee information
- And more!

## Setup Instructions

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with your Congress.gov API key:
   ```
   REACT_APP_CONGRESS_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm start
   ```

### CodeSandbox Setup

1. Fork this repository
2. Create a new CodeSandbox project
3. Import your forked repository
4. Add your Congress.gov API key in CodeSandbox's environment variables:
   - Go to "Server Control Panel" (or press Cmd/Ctrl + Shift + P)
   - Select "Environment Variables"
   - Add `REACT_APP_CONGRESS_API_KEY` with your API key
5. The app should start automatically

## API Key

You'll need a Congress.gov API key to use this application. You can get one at:
https://api.congress.gov/

## Technologies Used

- React
- TypeScript
- Chakra UI
- Axios
- React Router

## Contributing

Feel free to submit issues and enhancement requests! 