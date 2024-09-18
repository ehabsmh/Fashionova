# Fashionova

Welcome to Fashionova, an innovative e-commerce platform designed for seamless shopping and efficient product management. This web application provides a robust and intuitive interface for both administrators and shoppers, ensuring a smooth experience for all users.

## API Documentation

https://documenter.getpostman.com/view/25562679/2sAXqqePFj#intro

## Overview

A web application offering affordable, high-quality clothing.

Categorized list of clothes with gender-specific sections.

Advanced filtering options including price, top sellers, color, and size.

create your own trademark. Platform for users to create and sell their own merchandise. (version 2.0.0)

**For Shoppers**

- Choose between male or female wear categories for easier navigation.

- Browse different categories of clothes (t-shirts, pants, dresses, etc.) for efficient shopping.

- Browse different subcategories of clothes.

- Add clothes to my cart and proceed to checkout seamlessly.

- Browse clothes with different variants, each variant will have its color and color's sizes

- Each color have its related images.

- Create an account to save preferences and order history.

  **Upcoming features (v2):**

  - Filter clothes by price, color, size, top-rated, or top sellers(version 2.0.0) for a personalized shopping experience.

  - Rate and review products to share my experience with others.

  - receive personalized recommendations based on my browsing and purchase History.

  - Add products to wishlist for future purchase consideration.

## Folder and File Structure

All files and folders will be organized within the src folder.

- **[api/v1:](https://github.com/ehabsmh/Fashionova/tree/main/backend/src/api/v1)**

  - **[/Controllers](https://github.com/ehabsmh/Fashionova/tree/main/backend/src/api/v1/controllers)**
    Contains the business logic for each endpoint.

  - **[/views](https://github.com/ehabsmh/Fashionova/tree/main/backend/src/api/v1/views)**
    Stores the endpoint definitions.

  - **[/middlewares](https://github.com/ehabsmh/Fashionova/tree/main/backend/src/api/v1/middlewares)**
    Includes auth.ts, responsible for verifying user tokens.

- **[models:](https://github.com/ehabsmh/Fashionova/tree/main/backend/src/models)**
  Defines the database schemas and models.

- **[Storage:](https://github.com/ehabsmh/Fashionova/tree/main/backend/src/storage)**
  Manages the connection to the MongoDB server.

- **[utils:](https://github.com/ehabsmh/Fashionova/tree/main/backend/src/utils)**
  Contains utility functions used in business logic.

## Technologies

- Typescript
- ExpressJS
- Mongoose ODM

## Third Services

- `Multer` for handling file uploads
- `Cloudinary` to upload files to cloud.
- `nodemailer` for sending emails.
- `bcrypt` to encrypt password.
- `jsonwebtoken` to handle authentication and authorization mechanisms.
