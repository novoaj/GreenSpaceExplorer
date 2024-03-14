export default function ParkScore({parkScore}){
    // currently rounding up to nearest whole number of stars
    return (
        <div style={{ fontWeight:"normal", fontSize: "medium"}}>
        {parkScore < 1 ? 
        <p>Rating: NA</p> : 
        <p>Rating: {Math.ceil(parkScore)} <span className="star">&#9733;</span>'s</p>
        }
        </div>
        
        
    )
}