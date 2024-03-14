from flask import Flask, jsonify, make_response, request
import requests
from PIL import Image
from io import BytesIO
import math
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, unset_jwt_cookies, jwt_required, JWTManager
import os
import sys
from random import randint
import pymongo
from dotenv import load_dotenv
import certifi
import mysql.connector
from mysql.connector import errorcode
from datetime import datetime, timedelta, timezone
import hashlib
import json
from comment_moderation import moderate_comment
from park_score_calculator import calculate_overall_score


# MySQL: https://learn.microsoft.com/en-us/azure/mysql/flexible-server/connect-python
host_url = os.environ.get("DB_HOST_URL")
user = os.environ.get("MYSQL_USER")
password = os.environ.get("MYSQL_PASS")

config = {
  'host': host_url,
  'user':user,
  'password':password,
  'database':'green-space-explore'
}
try:
   conn = mysql.connector.connect(**config)
   print("MySQL Connection established")
except mysql.connector.Error as err:
  if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
    print("Something is wrong with the user name or password")
  elif err.errno == errorcode.ER_BAD_DB_ERROR:
    print("Database does not exist")
  else:
    print(err)
else:
    cursor = conn.cursor()
    # Drop previous table of same name if one exists
    # cursor.execute("DROP TABLE IF EXISTS users;")
    # print("Finished dropping table (if existed).")
    # Create table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id serial PRIMARY KEY, 
            username VARCHAR(50), 
            password VARCHAR(32)
        );
    """)
    # print("Finished creating users table.")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_ratings (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50),
            place_id VARCHAR(255),
            rating INT,
            UNIQUE KEY (username, place_id)
        );
    """)
    # print("created user_ratings table")
    # Cleanup
    conn.commit()
    cursor.close()
    conn.close()
    print("Done.")

#MongoDB init
ca = certifi.where() # https://stackoverflow.com/questions/54484890/ssl-handshake-issue-with-pymongo-on-python3
load_dotenv()
CONNECTION_STRING = os.environ.get("COSMOS_CONNECTION_STRING")
DB_NAME = os.environ.get("MONGODB_NAME")
COLLECTION_NAME = "posts"
client = pymongo.MongoClient(CONNECTION_STRING, tlsCAFile=ca)
# Create database if it doesn't exist
db = client[DB_NAME]
if DB_NAME not in client.list_database_names():
    # Create a database with 400 RU throughput that can be shared across
    # the DB's collections
    db.command({"customAction": "CreateDatabase", "offerThroughput": 400})
    print("Created db '{}' with shared throughput.\n".format(DB_NAME))
else:
    print("Using database: '{}'.\n".format(DB_NAME))
# create collection if it doesn't exist
# db[COLLECTION_NAME].drop()
collection = db[COLLECTION_NAME] 
if COLLECTION_NAME not in db.list_collection_names():
    # Creates a unsharded collection that uses the DBs shared throughput
    db.command(
        {"customAction": "CreateCollection", "collection": COLLECTION_NAME}
    )
    print("Created collection '{}'.\n".format(COLLECTION_NAME))
else:
    print("Using collection: '{}'.\n".format(COLLECTION_NAME))
# defining indexes for querying
indexes = [
    {"key": {"_id": 1}, "name": "_id_1"}, # _id is primary key
    # {"key": {"username": 2}, "name": "_id_2"}, # secondary key
]
db.command(
    {
        "customAction": "UpdateCollection",
        "collection": COLLECTION_NAME,
        "indexes": indexes,
    }
)
print("Indexes are: {}\n".format(sorted(collection.index_information())))


# init app
app = Flask(__name__)

# jwt config
app.config["JWT_SECRET_KEY"] = "some_key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
jwt = JWTManager(app)
CORS(app)
cors = CORS(app, resource={
    r"/*":{
        "origins":"*"
    }
})
google_key = os.environ.get("MAPS_API_KEY")
weather_key = os.environ.get("WEATHER_API_KEY")

# https://learn.microsoft.com/en-us/azure/cosmos-db/mongodb/quickstart-python?tabs=azure-portal%2Cvenv-windows%2Cwindows
"""
uses place_id to grab related comments from our database
for right now, just hardcode responses
"""
@app.route("/get-comments", methods=["POST"])
def get_comments():
    # db interaction here
    place_id = request.json.get("place_id")
    try:
        result = collection.find_one({"_id": place_id})
        
        if result:
            posts_list = result.get("posts", [])  # list of dicts, each dict is a post
            return jsonify(posts_list), 200
        else:
            return jsonify({"msg": "No posts found for the given place_id"}), 200

    except Exception as e:
        return {"msg": "db error. couldn't retrieve posts"}, 500
"""
posts a comment to this place_id in our mongo database
"""
@app.route("/post-comment", methods=["POST"])
def post_comment():
    try:
        place_id = request.json.get("place_id")
        user_id = request.json.get("user_id")
        content = request.json.get("content")
        print(place_id, user_id, content)

        if moderate_comment(content):
            return {"msg": "Comment flagged as inappropriate"}, 403


        # db interaction here
        post = [
            {"username": user_id, "content": content},
        ]
        collection.update_one(
            {"_id":place_id},
            {"$push": {"posts" : post}}, 
            upsert=True
        )
        
        return {"msg": "post successful!"}, 200
    except: 
        return {"msg": "Error posting the message"}, 500
    
"""
generates jwt based on username. jwt is used for authorization. we caan now make it so certain
endpoints require the jwt authorization from the frontend
# https://dev.to/nagatodev/how-to-add-login-authentication-to-a-flask-and-react-application-23i7
"""
def create_token(username, password):
    print("creating jwt token")
    access_token = create_access_token(identity=username)
    response = {"access_token": access_token}
    return response
"""
loogut endpoint, removes jwt
"""
@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response
@app.after_request
def after_request(response):
    header = response.headers
    header["Access-Control-Allow-Origin"] = "*"
    return response
"""
runs after every request to app object. refreshes jwt token which by default lasts 1 hour
"""
@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        return response
# Get's coordinats of address
# Returns dictionary
def geocode_address(address, api_key):
    # Converts address to latitude and longitude.
    endpoint = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': api_key
    }
    response = requests.get(endpoint, params=params).json()
    
    if response['status'] == 'OK':
        location = response['results'][0]['geometry']['location']
        return location
    else:
        raise Exception("Error geocoding address. Google API returned status: " + response['status'])

# Finds nearby parks based on latitude and longitude
# Returns list of dictionaries with name, address, location
def find_nearby_parks(lat, lng, api_key, radius=3000):
    endpoint = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        'location': f"{lat},{lng}",
        'radius': radius,
        'type': 'park',
        'key': api_key
    }
    
    response = requests.get(endpoint, params=params).json()
    # https://developers.google.com/maps/documentation/places/web-service/search-nearby
    if response['status'] == 'OK' or response['status'] == 'ZERO_RESULTS':
        return [{
            'name': place['name'],
            'address': place['vicinity'],
            'location': place['geometry']['location'],
            'place_id':place["place_id"],
            'icon': place["icon"]
            # 'rating': place['rating']
        } for place in response['results']]
    else:
        raise Exception("Error finding parks. Google API returned status: " + response['status'])

# Returns weather data using openweather api
def get_weather(lat, lon, api_key):  
    # Base URL for the OpenWeatherMap API
    base_url = "http://api.openweathermap.org/data/2.5/weather"
    # Parameters for the API call
    unit = 'imperial' 
    params = {
        'lat': lat,
        'lon': lon,
        'appid': api_key,
        'units': unit 
    }
    try:
        response = requests.get(base_url, params=params)
        if response.status_code == 200:
            weather_data = response.json()
            return weather_data
        else:
            print(f"Error fetching data: {response.status_code}")
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

# Returns air quality data based on coordinates
# Returns dictionary - currently not working, error code 403
def get_air_quality(lat, lng, api_key):
    endpoint = "https://api.airvisual.com/v2/nearest_city"
    params = {
        'lat': lat,
        'lon': lng,
        'key': api_key
    }

    try:
        response = requests.get(endpoint, params=params)
        if response.status_code == 200:
            air_quality_data = response.json()
            return air_quality_data
        else:
            # A different status code other than 200 was returned
            print(f"Error fetching data: {response.status_code}")
            print(response.json())  # Print the error message if any
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

def calculate_zoom_level(radius):
    equator_length = 40075004  # in meters
    width_in_pixels = 600  # width of the image in pixels
    meters_per_pixel = radius * 2 / width_in_pixels
    zoom = math.floor(math.log(equator_length / meters_per_pixel / 256) / math.log(2))
    return zoom


@app.route('/geocode', methods=['GET'])
def geocode():
    address = request.args.get('address', default='', type=str)
    if address:
        try:
            location = geocode_address(address, google_key)
            return jsonify(location), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'No address provided'}), 400
    

"""
/nearby_parks endpoint
"""
@app.route('/nearby_parks', methods=['POST'])
def nearby_parks():
    lat = float(request.json.get("lat"))
    lng = float(request.json.get("lng"))
    # lat = request.args.get('lat', type=float)
    # lng = request.args.get('lng', type=float)
    if lat is not None and lng is not None:
        try:
            parks = find_nearby_parks(lat, lng, google_key)
            # Create a response object and set headers to prevent caching
            response = make_response(jsonify(parks))
            response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'
            return response
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Latitude and longitude required'}), 400

@app.route('/get-place-coords', methods=['POST'])
def get_place_coords():
    place_id = request.json.get("place_id")
    if not place_id:
        return jsonify({"error": "Place ID is required"}), 400

    endpoint = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "key": google_key,
        "fields": "geometry"  # We are only interested in the geometry field
    }

    try:
        response = requests.get(endpoint, params=params)
        result = response.json()

        if response.status_code == 200 and result.get("status") == "OK":
            location = result["result"]["geometry"]["location"]
            return jsonify(location), 200
        else:
            error_message = result.get("error_message", "Failed to fetch location data")
            return jsonify({"error": error_message}), 500

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500



@app.route('/weather', methods=['GET'])
def weather():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    if lat is not None and lon is not None:
        weather_data = get_weather(lat, lon, weather_key)
        if weather_data:
            return jsonify(weather_data), 200
        else:
            return jsonify({'error': 'Could not fetch weather data'}), 500
    else:
        return jsonify({'error': 'Latitude and longitude required'}), 400

@app.route('/air_quality', methods=['GET'])
def air_quality():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    if lat is not None and lng is not None:
        air_quality_data = get_air_quality(lat, lng, google_key)
        if air_quality_data:
            return jsonify(air_quality_data), 200
        else:
            return jsonify({'error': 'Could not fetch air quality data'}), 500
    else:
        return jsonify({'error': 'Latitude and longitude required'}), 400
    nearby_parks
@app.route('/calculate_zoom', methods=['GET'])
def calculate_zoom():
    radius = request.args.get('radius', default=3000, type=int)
    zoom = calculate_zoom_level(radius)
    return jsonify({"zoom": zoom}), 200

@app.route("/handle-login", methods=["POST"])
def handle_login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    # check if username and password in db and password is correct.
    try:
        conn = mysql.connector.connect(**config)
        print("Connection established")
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            return {"msg": "Something is wrong with the user name or password"}, 500
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            return {"msg":"Database does not exist"}, 500
        else:
            print(err) # throw 500 to frontend if db transactions fail
            return {"msg": err}, 500
    else:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM `users` WHERE username = %s
        """, (username,)) # args need to be an iterable - tuple or list
        
        data = cursor.fetchall() # tuple of results: ((id,username, password), ...)
        
        # Cleanup
        cursor.close()
        conn.close()
    
    # compare md5(input password) to password in db
    hashed_password = hashlib.md5(password.encode()).hexdigest()
    if len(data) == 0:
        # no username in db, return 401
        return {"msg": "Wrong username or password"}, 401
    if hashed_password != data[0][2]: # hardcoded logic, 401 if error, check against db when implemented
        return {"msg": "Wrong username or password"}, 401

    token = create_token(username, password) # create jwt auth token
    print(username, password)
    return jsonify({
        "msg": "succesful login!",
        "username": username,
        "password": password,
        "token": token
    })

@app.route("/handle-register", methods=["POST"])
def handle_register():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    # if user not in db, insert into "users" table and commit 
    # https://stackoverflow.com/questions/1240852/is-it-possible-to-decrypt-md5-hashes
    try:
        conn = mysql.connector.connect(**config)
        print("Connection established")
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            return {"msg": "Something is wrong with the user name or password"}, 500
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            return {"msg":"Database does not exist"}, 500
        else:
            print(err) # throw 500 error to frontend if database connection fails
            return {"msg": err}, 500
    else:
        cursor = conn.cursor()
        cursor.execute("""
        SELECT * FROM `users` WHERE username = %s
        """, (username,)) # args need to be an iterable - tuple or list
        
        data = cursor.fetchall() # tuple of results: ((id,username, password), ...)

        if len(data) != 0:
            return { "msg": "This username is taken!"}, 401
        else:
            # insert user into db, use md5 to hash password
            cursor.execute("""
                INSERT INTO `users` (username, password) VALUES(%s, md5(%s))
                """, (username, password))
            conn.commit()
        cursor.close()
        conn.close()
    print("db transaction Done.")
    token = create_token(username, password)
    return jsonify({
        "msg" : "successful signup!",
        "username": username,
        "password": password,
        "token" : token
    })

@app.route('/get-park-score', methods=['POST'])
def get_park_score():
    data = request.json
    place_id = data.get("place_id")

    if not place_id:
        return jsonify({"error": "Place ID is required"}), 400

    try:
        score = calculate_overall_score(place_id)
        return jsonify({"place_id": place_id, "score": score}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/set-user-rating", methods=["POST"])
def set_user_rating():
    data = request.json
    username = data.get("username")
    place_id = data.get("place_id")
    rating = data.get("rating")
    try:
        conn = mysql.connector.connect(**config)
        print("Connection established")
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            return {"msg": "Something is wrong with the user name or password"}, 500
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            return {"msg":"Database does not exist"}, 500
        else:
            print(err) # throw 500 error to frontend if database connection fails
            return {"msg": err}, 500
    else:
        try:
            cursor = conn.cursor()
            # Attempt to insert or update the rating
            cursor.execute("INSERT INTO user_ratings (username, place_id, rating) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE rating = %s", (username, place_id, rating, rating))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"msg": "Rating set successfully"})
        except mysql.connector.Error as err:
            conn.rollback()
            cursor.close()
            conn.close()
            return jsonify({"error": f"Error setting rating: {err}"}), 500
"""
gets user rating for username+place_id combination. if none is found, 0 returned
"""
@app.route("/get-user-rating", methods=["POST"])
def get_user_rating():
    data = request.json
    username = data.get("username")
    place_id = data.get("place_id")

    try:
        conn = mysql.connector.connect(**config)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT rating FROM user_ratings 
            WHERE username = %s AND place_id = %s
        """, (username, place_id))
        result = cursor.fetchone()
        cursor.close()
        conn.close()

        if result:
            return jsonify({"rating": result[0]})
        else:
            return jsonify({"rating": 0})
    except mysql.connector.Error as err:
        return jsonify({"error": "Database error occurred", "details": str(err)}), 500
    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

            
import logging

# Set up basic logging
logging.basicConfig(filename='error.log', level=logging.DEBUG)
