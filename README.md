# TTRPG Combat Tracker

This project is a web-based TTRPG Combat Tracker designed to help manage combat 
encounters, track combatants, and maintain turn order in tabletop role-playing games. 
It ensures combat state persistence across sessions and offers a separate player view 
for enhanced gameplay experience.

## Features

- Real-time combat management
- Combatant health tracking
- Turn order management
- Separate player view
- State persistence across sessions

## Getting Started

### Prerequisites

Make sure you have Docker and Docker Compose installed on your system.

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Building and Running with Docker Compose

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ttrpg-combat-tracker.git
   cd ttrpg-combat-tracker```

2. Build and run the application using Docker Compose:

   ```docker-compose up --build```

This will build the Docker images and start the application. The application
will be accessible on port 4006.

