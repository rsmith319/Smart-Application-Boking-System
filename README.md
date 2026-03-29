# SmartQueue Frontend

A modern, role-based appointment booking interface built with React and TypeScript. This frontend connects to a backend API to manage users, authentication, and appointment workflows.

---

## Overview

SmartQueue is a smart appointment booking system designed to streamline scheduling between customers and service providers. The frontend delivers a responsive, premium user experience with role-based dashboards and dynamic content rendering.

---

## Features

* Role-based dashboards (Customer, Provider, Admin)
* Login authentication system
* Context-based global state management
* Dynamic UI rendering based on user role
* Modern UI with Tailwind CSS
* Responsive design for all screen sizes
* API integration with backend (Node.js + TypeORM)

---

## Tech Stack

* React (with TypeScript)
* React Router
* Context API (state management)
* Tailwind CSS
* Fetch API
* Lucide Icons

---

## Project Structure

```
src/
│
├── components/       # Reusable UI + logic (auth, cards, etc.)
├── pages/            # Main pages (Login, Profile, Landing)
├── data/             # Types and schemas
├── context/          # Global state (user session)
├── services/         # API calls (fetch helpers)
├── assets/           # Images / static files
└── App.tsx           # Root component
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/smartqueue-frontend.git
cd smartqueue-frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

---

## Environment Setup

Make sure your backend is running at:

```
http://localhost:3002
```

If needed, configure API URLs inside your service files.

---

## Authentication Flow

1. User enters email and password
2. Frontend sends POST request to:

```
/api/v1/login
```

3. Backend returns user object
4. User is stored in Context API
5. UI updates based on role:

   * CUSTOMER → Customer Dashboard
   * PROVIDER → Provider Dashboard
   * ADMIN → Admin Dashboard

---

## Role-Based Rendering

The app dynamically renders UI based on the user's role:

* Customer → Booking + personal info
* Provider → Service management + queue
* Admin → System overview + user control

---

## Future Improvements

* JWT authentication with secure cookies
* Protected routes
* Real-time appointment updates
* Notifications system
* Dashboard analytics (charts)
* Mobile app version (React Native)

---

## Screens

* Login Page
* Role-Based Dashboard (Profile)
* Appointment Management (planned)

---

## Development Notes

* Ensure backend API is running before using login
* Keep `.env` files out of version control
* Use consistent role naming (`CUSTOMER`, `PROVIDER`, `ADMIN`)

---

## License

This project is for educational and development purposes.

---

## Author

Roger Smith
