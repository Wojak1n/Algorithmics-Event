# \# Algorithmics Script Manager

# 

# A comprehensive web application for managing and presenting scripts for the Algorithmics IT Competition 2025. This tool helps teams organize their presentations, track progress, and deliver polished performances.

# 

# \## Features

# 

# \### 🏠 Homepage

# \- Event overview with competition branding

# \- Quick statistics dashboard

# \- Dark mode toggle

# \- Navigation to all features

# 

# \### 👥 Team Directory

# \- Add, edit, and delete teams

# \- Team information management (name, slogan, project, members)

# \- View team statistics and scene counts

# \- Responsive team cards layout

# 

# \### 📝 Scene Management

# \- Create and organize scenes for each team

# \- Rich text script editor with auto-save

# \- Scene status tracking (Not Started, In Progress, Rehearsed, Complete)

# \- Duration tracking and notes

# \- Scene ordering and organization

# 

# \### 🔍 Search \& Filter

# \- Global search across teams and scenes

# \- Filter by content type (teams, scenes, or all)

# \- Real-time search results

# \- Highlighted search matches

# 

# \### 🎭 Presentation Mode

# \- Full-screen presentation view

# \- Built-in timer with start/pause/reset

# \- Scene navigation

# \- URL parameter support for direct scene access

# \- Clean, distraction-free interface

# 

# \### 🌙 Additional Features

# \- Dark mode with persistence

# \- Responsive design (desktop and mobile)

# \- Local storage data persistence

# \- Sample data for demonstration

# \- Toast notifications for user feedback

# \- Keyboard shortcuts (Ctrl+S to save)

# 

# \## Technology Stack

# 

# \- \*\*Frontend\*\*: Next.js 15 with TypeScript

# \- \*\*Styling\*\*: Tailwind CSS

# \- \*\*Icons\*\*: Lucide React

# \- \*\*Notifications\*\*: React Hot Toast

# \- \*\*State Management\*\*: React Context + useReducer

# \- \*\*Data Storage\*\*: Browser localStorage

# \- \*\*Development\*\*: ESLint, TypeScript strict mode

# 

# \## Getting Started

# 

# \### Prerequisites

# \- Node.js 18+

# \- npm or yarn

# 

# \### Installation

# 

# 1\. Clone the repository:

# ```bash

# git clone <repository-url>

# cd algorithmics-script-manager

# ```

# 

# 2\. Install dependencies:

# ```bash

# npm install

# ```

# 

# 3\. Run the development server:

# ```bash

# npm run dev

# ```

# 

# 4\. Open \[http://localhost:3000](http://localhost:3000) in your browser

# 

# \### Sample Data

# Click "Load Sample Data" on the homepage to populate the application with example teams and scenes for demonstration purposes.

# 

# \## Usage Guide

# 

# \### Adding Teams

# 1\. Navigate to the Team Directory

# 2\. Click "Add Team"

# 3\. Fill in team information (name, slogan, project, members)

# 4\. Save to create the team

# 

# \### Managing Scenes

# 1\. Go to a team's scene page

# 2\. Click "Add Scene" to create new scenes

# 3\. Edit scenes to add script content, set duration, and update status

# 4\. Use the status buttons to track progress

# 

# \### Presentation Mode

# 1\. Select a team and scene from the presentation page

# 2\. Use the timer controls to track presentation time

# 3\. Enter fullscreen mode for distraction-free presenting

# 4\. Navigate between scenes as needed

# 

# \### Search Functionality

# 1\. Use the search page to find specific content

# 2\. Filter by teams or scenes

# 3\. Click results to navigate directly to the content

# 

# \## Project Structure

# 

# ```

# src/app/

# ├── components/          # Reusable UI components

# ├── context/            # React Context for state management

# ├── lib/               # Utility functions and data management

# ├── types/             # TypeScript type definitions

# ├── teams/             # Team-related pages

# ├── scenes/            # Scene management pages

# ├── search/            # Search functionality

# ├── presentation/      # Presentation mode

# └── globals.css        # Global styles

# ```

# 

# \## Development

# 

# \### Building for Production

# ```bash

# npm run build

# ```

# 

# \### Linting

# ```bash

# npm run lint

# ```

# 

# \### Type Checking

# The project uses TypeScript with strict mode enabled for better code quality and developer experience.

# 

# \## Contributing

# 

# 1\. Fork the repository

# 2\. Create a feature branch

# 3\. Make your changes

# 4\. Test thoroughly

# 5\. Submit a pull request

# 

# \## License

# 

# This project is created for the Algorithmics IT Competition 2025.

# 

# \## Support

# 

# For questions or issues, please contact the development team or create an issue in the repository.



