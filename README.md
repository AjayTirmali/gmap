# Real-Time Location Map with MERN Stack

A real-time location map application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and Leaflet for map visualization. This application allows users to set origin and destination locations and visualize them on a map, with the ability to switch between them.

## Features

- Interactive map using Leaflet
- Input fields for origin and destination locations
- Switch functionality to swap origin and destination
- Real-time updates
- MongoDB database for storing location data
- RESTful API with Express.js

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

### Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/locationMap
```

4. Start the backend server:

```bash
npm run dev
```

The server will run on http://localhost:5000

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend development server: 

```bash
npm start
```

The application will open in your browser at http://localhost:3000

## Usage

1. Enter an origin location in the "Origin Location" input field and click "Set Origin"
2. Enter a destination location in the "Destination Location" input field and click "Set Destination"
3. Use the switch button (⇄) to swap the origin and destination
4. The map will display markers for both locations

## API Endpoints

- `GET /api/locations` - Get all locations
- `GET /api/locations/:id` - Get a specific location
- `POST /api/locations` - Create a new location
- `PATCH /api/locations/:id` - Update a location
- `DELETE /api/locations/:id` - Delete a location

## Technologies Used

- **Frontend**: React.js, Leaflet, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Map Library**: Leaflet

## License

This project is licensed under the MIT License. # gmap
# gmap
