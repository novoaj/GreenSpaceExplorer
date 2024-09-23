# Green Space Explorer
https://gse-web.azurewebsites.net/
## Overview
Green Space Explorer is a dynamic social platform that allows users to discover and share insights on green spaces like parks and trails. This platform leverages the Google Maps API to provide an intuitive way for users to find nearby parks. 
## Demo
https://github.com/user-attachments/assets/ea7d3462-098b-4252-a4b0-9351fd56c670

## Features
- Interactive Map: Utilizes the Google Maps API to locate and explore green spaces in your vicinity.
- User Ratings and Posts: Share your experiences and rate green spaces to help others discover new locations.
- Secure User Management: Safeguard user credentials using advanced hashing techniques before storage in our MySQL database.
- Dynamic Content Sharing: Users can post comments and rate parks. 
  
## Technologies used
- Frontend: Developed with React.js, our user interface uses Bootstrap and CSS for a polished look that is both responsive and interactive. 
- Backend: Python and Flask form the backbone of our API, facilitating user interactions with databases and external APIs.
- Databases: User data, along with posts and ratings, are securely stored in MySQL and MongoDB databases, hosted on Microsoft Azure for reliability and scalability.
- Machine Learning: There are two AI components to this project. A content moderation system using a pre trained model and an additional park score that incorporates the sentiment of the comments.
- Cloud:
  - Flask API is deployed to Azure Virtual Machine with nginx handling user requests and gunicorn for concurrent processing, ensuring the application is scalable and capable of supporting multiple users simultaneously.
  - Azure Cosmos DB is used for NoSQL MongoDB data storage, allowing for efficient querying based on "placeIds" to manage user interactions effectively.
  - Azure MySQL instance used for a structured SQL solution for securely storing user authentication information.
  - Azure App Service used to host the React frontend, offering a reliable platform for delivering an optimal user experience.


