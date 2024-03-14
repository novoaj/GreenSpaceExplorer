import { useEffect, useState } from "react";
import {toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./stars.css"

export default function StarRating(props){
    const [rating, setRating] = useState(0);
    let username = localStorage.getItem("username");
    const loginAlert = () => toast("You must be logged in to access this feature!");

    useEffect(() => {
        setRating(props.userRating || 0);
    }, [props.userRating]);

    const handleRatingClick = (index) => {
        setRating(index);
        if (username == null){
            loginAlert();
        }else{
            if (props.onRatingChange) {
                props.onRatingChange(index); // Inform parent component about change in rating
            }
        }
        
    };

    return (
        <div className="star-rating-container">
            <div className="rating-title">Rate This Park</div>
            <div className="star-rating">
                {[...Array(5)].map((star, index) => {
                    index += 1;
                    return (
                        <button
                            //disabled= {username === null} // If not logged in, can't submit rating
                            type="button"
                            key={index}
                            className={username === null ? "off": index <= rating ? "on" : "off"}
                            onClick={() => handleRatingClick(index)}
                        >
                            <span className="star">&#9733;</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
