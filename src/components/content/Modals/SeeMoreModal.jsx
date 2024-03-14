import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import StarRating from "../StarRating";
import Comment from "./Comment";
import {toast} from "react-toastify";
import ParkScore from "./ParkScore";


//TODO: consider how to handle data when it grows. Pages? Scroll? both?
export default function SeeMoreModal(props) {
    const [data, setData] = useState(null);
    const [weather, setWeather] = useState(null);
    const [userRating, setUserRating] = useState(0)
    const [initialRating, setInitialRating] = useState(0) // backend updates rating changes when modal is closed
    const [parkScore, setParkScore] = useState(undefined);
    let username = localStorage.getItem("username") // null if it doesn't exist
    const ratingSet = () => toast.success("Successfully rated this green space");

    const handleRatingChange = (newRating) => {
        console.log("rating clikced")
        
        if (username !== null) {
            setUserRating(newRating);
        }
    }
    useEffect(() => {
        if (props.show) {
            // Fetching comments
            fetch("/get-comments", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    place_id: props.place_id
                })
            })
            .then(res => res.json())
            .then(res_json => {
                if (res_json.msg === "No posts found for the given place_id"){
                    console.log("no comments for this place!")
                }else{
                    setData(res_json); 
                }
            }).catch(err => { // this case activates if get-comments returns 500 (db error)
                console.log("error fetching data")
            })
            // Fetching weather data
            fetch("/get-place-coords", { 
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    place_id: props.place_id
                })
            })
            .then(res => res.json())
            .then(coords => {
                if (coords.lat && coords.lng) {
                    let url = `/weather?lat=${coords.lat}&lon=${coords.lng}`
                    console.log(url)

                    return fetch(`/weather?lat=${coords.lat}&lon=${coords.lng}`);
                }
                throw new Error('Coordinates not found');
            })
            .then(weatherRes => weatherRes.json())
            .then(weatherData => {
                setWeather(weatherData);
            })
            .catch(err => console.error("Error fetching weather data", err));

            // fetch current user rating of this place_id
            if (username !== null){
                fetch("/get-user-rating", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/json"
                    },
                    body: JSON.stringify({
                      username: username,
                      place_id: props.place_id  
                    })
                })
                .then(res=> res.json())
                .then(userRatingData => {
                    setUserRating(userRatingData.rating)
                    setInitialRating(userRatingData.rating)
                    //console.log(userRatingData.rating)
                })
                .catch(err => console.error(err))
            }

            fetch("/get-park-score", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    place_id: props.place_id
                })
            })
            .then(res => res.json())
            .then(parkScoreResponse => {
                console.log(parkScoreResponse) // should porbably have some sort of display/return value if no data exists for this park yet
                console.log(parkScoreResponse.score) // TODO figure out where to display park score
                setParkScore(parkScoreResponse.score);
            })
        }
    }, [props.show, props.place_id]);

    const handleClose = () => {
        if (username !== null && userRating !== initialRating) {
            fetch("/set-user-rating", {
                method: "POST",
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    place_id: props.place_id,
                    rating: userRating
                })
            })
                .then(res => res.json())
                .then(response => {
                    if (response.msg === "Rating set successfully"){
                        ratingSet();
                    }
                })
                .catch(err => console.log(err))
        }
        props.onHide()
    }
    return (
        <Modal
            {...props}
            size="lg"
            centered
            onHide={handleClose}
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {props.name}
                    <ParkScore parkScore={parkScore}/>
                </Modal.Title>
                
            </Modal.Header>
            <Modal.Body>
                {weather && (
                    <div>
                        <h4>Weather Information</h4>
                        <p><strong>Temperature:</strong> {weather.main.temp}°F | <strong>Condition:</strong> {weather.weather[0].main} | <strong>Humidity:</strong> {weather.main.humidity}% | <strong>Wind Speed:</strong> {weather.wind.speed} mph</p>
                    </div>
                )}
                <h5>Park Feed</h5>
                {data && data.length > 0 ? 
                    data.map((commentArray, index) => (
                        <Comment
                            key={index}
                            content={commentArray[0].content}
                            username={commentArray[0].username}
                        />
                    ))
                    : 
                    <p>No comments available</p>
                }
                
            </Modal.Body>
            <Modal.Footer>
                <StarRating
                    userRating={userRating}
                    onRatingChange={handleRatingChange}
                    />
            </Modal.Footer>
        </Modal>
    );
}
