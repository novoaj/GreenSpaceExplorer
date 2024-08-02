# Green Space Explorer
https://gse-web.azurewebsites.net/
## Overview
Green Space Explorer is a dynamic social platform that allows users to discover and share insights on green spaces like parks and trails. This platform leverages the Google Maps API to provide an intuitive way for users to find nearby parks. 

## Features
- Interactive Map: Utilizes the Google Maps API to locate and explore green spaces in your vicinity.
- User Ratings and Posts: Share your experiences and rate green spaces to help others discover new locations.
- Secure User Management: Safeguard user credentials using advanced hashing techniques before storage in our MySQL database.
- Dynamic Content Sharing: Users can post comments and rate parks. 
  
## Technologies
- Frontend: Developed with React.js, our user interface uses Bootstrap and CSS for a polished look that is both responsive and interactive. 
- Backend: Python and Flask form the backbone of our API, facilitating user interactions with databases and external APIs.
- Databases: User data, along with posts and ratings, are securely stored in MySQL and MongoDB databases, hosted on Microsoft Azure for reliability and scalability.
- Machine Learning: There are two AI components to this project. A content moderation system using a pre trained model and an additional park score that incorporates the sentiment of the comments.
- Cloud:
  - Flask API is deployed to Azure Virtual Machine with nginx to handle user requests and gunicorn for processing concurrent requests, allowing for multiple users to use our app at the same time.
  - Azure Cosmos DB is used for a noSQL MongoDB data storage solution for storing user interactions, allowing for efficient querying based on "placeIds".
  - Azure MySQL instance used for a structured SQL solution for storing user authentication information.
  - Azure App Service used to host the React frontend.


