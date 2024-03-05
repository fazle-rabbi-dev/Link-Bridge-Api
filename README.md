# Link-Bridge-Api

Link-Bridge-Api is the RESTful API for the LinkBridge React app, providing seamless connection management and link aggregation functionalities.

**This api is deployed on** <a href="https://cyclic.sh">Cyclic.</a>

## Fun Fact 🤓
> [!NOTE]
> I created this project entirely using my **Android Phone** with apps: Acode & Termux.

## Features

- 🔒 User Authentication: Secure user authentication using JWT tokens.
- 🖼️ Profile Customization: Users can customize their profiles, including updating their bio and profile picture.
- 🔗 Link Management: Add, update, and delete custom links for your LinkTree profile.
- 🌐 Social Links Integration: Easily add and manage social media links to your profile.
- 🔑 Forgot Password: Password recovery functionality for users who forget their passwords.

## Live Demo 🎉
- https://link-bridge.vercel.app

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fazle-rabbi-dev/Link-Bridge-Api
   ```
2. Navigate to the project directory:
   ```bash
   cd Link-Bridge-Api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory and define the following environment variables:
   ```plaintext
    MONGODB_URI=
    JWT_SECRET=
    
    ACCESS_TOKEN_SECRET=
    REFRESH_TOKEN_SECRET=
    
    ACCESS_TOKEN_EXPIRY="1d"
    REFRESH_TOKEN_EXPIRY="10d"
    
    CLOUDINARY_CLOUD_NAME=
    CLOUDINARY_API_KEY=
    CLOUDINARY_API_SECRET=
    
    GMAIL_USERNAME=
    GMAIL_PASSWORD=<Write your app password, which you can obtain by enabling two-factor authentication in your Gmail account.>

   ```

## Usage

1. Start the server:
   ```bash
   npm run dev
   ```
2. The API will be accessible at `http://localhost:5000`.

## API Endpoints

- `/api/users`: User authentication & User profile management endpoints.
- `/api/links`: Link management endpoints.

## Project Structure
```
.
├── nodemon.json              // Configuration file for nodemon
├── package-lock.json
├── package.json
├── public                    // Contains publicly accessible files
├── README.md
├── src
│   ├── app.js
│   ├── controllers            // Contains controller logic for handling HTTP requests
│   │   ├── userController.js // Controller for user-related operations
│   ├── database               // Database-related logic and database connection setup
│   │   ├── User.js           // Database operations related to user management
│   │   └── db-connect.js     // Database connection setup
│   ├── index.js               // Entry point of the application
│   ├── middlewares            // Middleware functions for request processing
│   │   ├── authMiddleware.js       // Authentication middleware
│   │   ├── multerMiddleware.js     // Middleware for handling file uploads (if applicable)
│   │   ├── notFoundErrorHandler.js // Middleware for handling 404 errors
│   │   └── otherErrorHandler.js    // Other error handling middleware
│   ├── models                 // Database models/schema definitions
│   │   └── UserModel.js      // User model definition
│   ├── routes                 // Route definitions for different API endpoints
│   │   ├── index.js          // Main router file
│   │   ├── userRoutes.js     // Routes related to user management
│   ├── services               // Service layer containing business logic
│   │   ├── userService.js    // Service functions for user-related operations
│   └── utils                  // Utility functions and helper modules
│       ├── ApiError.js        // Custom API error handler
│       ├── ApiResponse.js    // Response format utility
│       ├── CustomError.js    // Custom error class definition
│       ├── cloudinary.js     // Cloudinary integration for file storage (if applicable)
│       ├── constants.js      // Constant values used throughout the application
│       ├── corsOptions.js    // CORS configuration options
│       ├── emailTemplates.js // Email template generation functions
│       ├── helpers.js        // Miscellaneous helper functions
│       ├── limiter.js        // Rate limiting configuration
│       └── sendEmail.js      // Email sending functionality
└── swagger.json              // Swagger/OpenAPI specification file
```

## Contributing

Contributions are welcome! Please feel free to fork the repository and submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Connect with me

> Let's connect! Reach out for collaborations, projects, or just a friendly chat.

<a target="_blank" href="https://linkedin.com/in/fazlerabbidev" ><img align="center" src="https://cdn.jsdelivr.net/npm/simple-icons@3.0.1/icons/linkedin.svg" alt="Fazle Rabbi" height="30" width="auto" /></a>
<a target="_blank" href="https://twitter.com/fazle_rabbi_dev" ><img align="center" src="https://seeklogo.com/images/T/twitter-x-logo-101C7D2420-seeklogo.com.png?v=638258862800000000" alt="Fazle Rabbi" height="30" width="auto" /></a>
<a target="_blank" href="https://medium.com/@fazle-rabbi-dev" ><img align="center" src="https://cdn.jsdelivr.net/npm/simple-icons@3.0.1/icons/medium.svg" alt="Fazle Rabbi" height="30" width="auto" /></a>
<a target="_blank" href="https://dev.to/fazle-rabbi-dev" ><img align="center" src="https://seeklogo.com/images/D/dev-to-logo-BDC0EFA32F-seeklogo.com.png" alt="Fazle Rabbi" height="30" width="auto" /></a>
<a target="_blank" href="https://facebook.com/fazlerabbidev" ><img align="center" src="https://seeklogo.com/images/F/facebook-icon-black-logo-133935095E-seeklogo.com.png" alt="Fazle Rabbi" height="30" width="auto" /></a>
<a target="_blank" href="https://instagram.com/fazle_rabbi_dev" ><img align="center" src="https://cdn.jsdelivr.net/npm/simple-icons@3.0.1/icons/instagram.svg" alt="Fazle Rabbi" height="30" width="auto" /></a>

*Feel free to explore, contribute, and get inspired!*

