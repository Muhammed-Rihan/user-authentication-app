# user-authentication-app
## User Authentication Web Application

This is a Node.js-based web application that provides user authentication using **Passport.js**. It supports:
- **Local authentication** with email/username and password.
- **Google OAuth 2.0** authentication.
- Password hashing with **bcrypt**.
- Session handling with **express-session**.
- PostgreSQL as the database.

## Features

- **User Registration:** Users can register with a username, email, and password.
- **User Login:** Users can log in using their registered credentials.
- **Google Login:** Authentication using Google OAuth.
- **Session Management:** Persistent user sessions with secure cookies.
- **Password Security:** Passwords are hashed using bcrypt before storing them in the database.

## Technologies Used

- **Backend:** Node.js, Express.js
- **Authentication:** Passport.js (local and Google strategies)
- **Database:** PostgreSQL
- **Session Management:** express-session
- **Hashing:** bcrypt
- **Environment Variables:** dotenv

## Prerequisites

Before running this application, make sure you have:

- Node.js installed (v14 or higher recommended)
- PostgreSQL database set up
- Google Cloud Console project with OAuth 2.0 credentials

