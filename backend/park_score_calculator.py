import mysql.connector
import pymongo
import certifi
import os
from dotenv import load_dotenv
from textblob import TextBlob 
from decimal import Decimal

# Load environment variables
load_dotenv()

# MySQL database configuration
config = {
  'host':'green-space-explore-mysql.mysql.database.azure.com',
  'user':'admin_gse',
  'password':'greenspace24!',
  'database':'green-space-explore'
}

# MongoDB configuration
CONNECTION_STRING = os.environ.get("COSMOS_CONNECTION_STRING")
DB_NAME = "green-space-explore-mongo-acct"
COLLECTION_NAME = "posts"
ca = certifi.where()
client = pymongo.MongoClient(CONNECTION_STRING, tlsCAFile=ca)

# Function to calculate average rating from MySQL
def calculate_average_rating(place_id):
    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        query = "SELECT AVG(rating) FROM user_ratings WHERE place_id = %s"
        cursor.execute(query, (place_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result[0] if result[0] is not None else 0
    except mysql.connector.Error as err:
        print(f"Error in MySQL: {err}")
        return 0

# Function to calculate sentiment score from MongoDB
def calculate_sentiment_score(place_id):
    try:
        client = pymongo.MongoClient(CONNECTION_STRING, tlsCAFile=ca)
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        result = collection.find_one({"_id": place_id})

        if result and "posts" in result:
            # Flatten the list of lists into a single list of dictionaries
            posts = [post for sublist in result["posts"] for post in sublist]

            # Now perform sentiment analysis on the flattened list
            sentiments = [TextBlob(post["content"]).sentiment.polarity for post in posts]
            average_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
            return average_sentiment
        else:
            return 0
    except Exception as e:
        print(f"Error in MongoDB: {e}")
        return 0



# Function to calculate overall score
def calculate_overall_score(place_id):
    avg_rating = calculate_average_rating(place_id)
    sentiment_score = calculate_sentiment_score(place_id)

    # Convert both values to float 
    avg_rating = float(avg_rating)
    sentiment_score = float(sentiment_score)

    # Calculate overall score
    overall_score = 0.75 * avg_rating + 0.25 * ((sentiment_score + 1) / 2)  # Normalizing sentiment to 0-1 scale
    return overall_score

