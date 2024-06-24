# Blog App Backend

This repository contains the backend code for a Blog App built with Express.js and MongoDB. The backend handles user authentication, post creation, liking posts, and image uploads. Key features include token verification for secure access, image uploading with Cloudinary, middleware for various functionalities, and robust error handling.

## Features

- **User Management**: User authentication and authorization using JWT tokens.
- **Post Management**: Create, read, update, and delete posts.
- **Toggle Like**: Like and unlike posts.
- **Token Verification**: Secure access to protected routes with JWT.
- **Image Upload**: Upload and manage images with Cloudinary.
- **Middleware**: Custom middleware for various functionalities including validation and error handling.
- **Validation**: Validation for ObjectId to ensure valid MongoDB document IDs.
- **Error Handling**: Centralized error handling for consistent API responses.

## Technologies Used

- **Express.js**: Web framework for Node.js.
- **MongoDB**: NoSQL database for data storage.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **JWT (JsonWebToken)**: For authentication and authorization.
- **Cloudinary**: Cloud-based image and video management services.
- **Bcrypt**: Library to hash user passwords.
- **Express-Async-Handler**: Simple middleware for handling exceptions inside of async express routes.

## Setup and Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/Walid12410/BlogApp-ExpressJs
    cd blog-app-backend
    ```

2. **Install dependencies**:
    ```bash
    npm install
    ```

3. **Set up environment variables**:
    Create a `.env` file in the root directory and add the following variables:
    ```env
    MONGODB_URI=your_mongodb_uri
    JWT_SECRET=your_jwt_secret
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```

4. **Start the server**:
    ```bash
    npm start
    ```

## API Endpoints

- **User Routes**:
    - POST /api/users/register: Register a new user.
    - POST /api/users/login: Authenticate a user and return a token.

- **Post Routes**:
    - GET /api/posts: Get all posts.
    - POST /api/posts: Create a new post.
    - GET /api/posts/:id: Get a single post by ID.
    - PUT /api/posts/:id: Update a post by ID.
    - DELETE /api/posts/:id: Delete a post by ID.

- **Like Routes**:
    - PUT /api/posts/like/:id: Toggle like on a post.

## Middleware

- **Auth Middleware**: Protect routes by verifying JWT tokens.
- **Error Handler**: Centralized error handling for API responses.
- **ObjectId Validator**: Validate MongoDB ObjectId for routes with parameters.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any improvements, bug fixes, or new features.

## License

This project is licensed under the MIT License.
