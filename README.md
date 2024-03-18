# Green Space Explorer

This project enables users to interact with, rate, discover, and post about green spaces such as parks and trails. This project utilizes
the Google Maps API for grabbing nearby green spaces. React was used for creating frontend components for the user to interact with. The databases 
used that persist our user data and posts/ratings are MySQL and MongoDB which were deployed to the Azure cloud. A MySQL table is used for the usernames and passwords
of users, using a one way hash function before storing any passwords in the database. The Mongo database is for holding posts that are associated with places. PlaceID is used as a primary identifier in this database 
which allows for us to grab associated posts for each place in an efficient manner. The backend is written in Python using the Flask microframework. This backend is simply an API that allows users to interact with our databases, and 
external APIs through frontend components. The backend contains endpoints as well as logic for ML/AI aspects of our project. On the backend we have a content moderation model trained 
to detect inappropriate posts and reject these from our website and database. 

Languages/Technologies Used:
- Python
- Flask
- Reactjs
- HTML
- CSS
- MongoDB
- MySQL
- Microsoft Azure
- Google Maps API
- Weather API: https://openweathermap.org/api
