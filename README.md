<<<<<<< HEAD
# Poker_Tracker
=======
```markdown
# PokerTrack

PokerTrack is a comprehensive poker hand tracking and analytics web application designed for serious poker players. It allows users to record, analyze, and improve their game by providing an intuitive interface for hand entry, detailed statistics, session management, and performance analytics across multiple devices.

## Overview

PokerTrack is built on modern web technologies, featuring a ReactJS-based frontend and an Express-based backend. The frontend uses Vite as its development server and integrates the Shadcn-UI component library with Tailwind CSS for styling. Client-side routing is managed by `react-router-dom`. The backend implements REST API endpoints using Express and utilizes MongoDB with Mongoose for data storage. Authentication is secured with JWT tokens, and real-time updates are handled using Socket.io.

The project structure is as follows:
- `client/`: Contains the frontend code.
- `server/`: Contains the backend code.
- `api/`: Implements API endpoint logic in the backend.
- `models/`: Defines data models using Mongoose.
- `services/`: Contains business logic for handling sessions, users, and hands.
- `routes/`: Defines API routes and authentication middleware.
- `config/`: Configuration files for database and environment variables.
- `utils/`: Utility functions for authentication and password management.

## Features

- **User Registration & Authentication**: Secure registration and login using email and password, with real-time form validation and email verification.
- **Main Dashboard**: Provides a snapshot of recent sessions, quick stats, and easy navigation to different sections such as Sessions, Analytics, and Players.
- **Session Management**: Users can create and manage poker sessions, with detailed input options for game type, stakes, and more.
- **Hand Recording**: An interactive poker table interface allows users to record and review hands with detailed action tracking.
- **Analytics Dashboard**: Comprehensive statistics and performance metrics are visualized through charts and graphs, helping users analyze their game and track progress.
- **Player Database & Notes**: Users can maintain a searchable database of players, with detailed performance records and notes.
- **Data Export & Sharing**: Export session summaries and hand histories in various formats compatible with poker analysis tools.
- **Multi-Device Synchronization**: Real-time sync across devices, with conflict resolution and offline mode support.
- **Mobile Responsiveness**: Optimized interfaces for tablets and phones to ensure a seamless experience across devices.

## Getting Started

### Requirements

To run PokerTrack, you will need the following technologies set up on your computer:
- Node.js (latest LTS version)
- npm (comes with Node.js)
- MongoDB (latest version)

### Quickstart

1. **Clone the repository:**
   ```sh
   git clone <repository_url>
   cd <repository_directory>
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up the environment variables:**
   - Create a `.env` file in the `server/` directory with the necessary variables (refer to `server/.env.example` for guidance).

4. **Run the project:**
   ```sh
   npm run start
   ```
   This command will start both the frontend and backend concurrently.

## License

The project is proprietary. 

```
© 2024.
```
```
>>>>>>> b317f81 (Initial commit)
