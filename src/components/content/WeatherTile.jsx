import "./weather.css"
import { Card } from "react-bootstrap"
export default function WeatherTile(props){
    // weather.id could help us w displaying some sort of picture to go with the location
    // id is 3 digits, 2xx: Thunderstorm,  3xx Drizzle, 5xx Rain, 6xx Snow,
    // 7xx Atmosphere, 800 = Clear, 80x Clouds
    // using props.id we should have a folder with images for the diferent conditions
    // use js object mapping ids to photos?, write function to go from 3 digits to a category (thunderstorm, drizzle, clear, etc)
    // props.id is 3 digits, (see above) x represents any digit. our goal is to get to one of our
    // weatherIcons keys from the 3 digit input (props.id)
    // <a href="https://www.freepik.com/free-vector/weather-icons-collection_972339.htm#query=weather&position=15&from_view=search&track=sph&uuid=19acff80-aa26-46f7-a79f-39ad0856513c">Image by anindyanfitri</a> on Freepik
    // /weather/Icons/
    // we want the icons to be placed in the top right of the card
    const weatherIcons = {
        "Thunderstorm" : "/Icons/Thunder.png",
        "Drizzle": "/Icons/Drizzle.png",
        "Rain": "/Icons/Drizzle.png",
        "Snow": "Icons/Snow.png",
        "Atmosphere": "/Icons/Atmosphere.png",
        "Clear": "/Icons/Clear_D.png",
        "Clouds": "/Icons/Cloud_D.png"
    }
    let category;
    const firstDigit = Math.floor(props.id / 100);
    if (props.id === 800) {
        category = "Clear";
    } else if (firstDigit === 2) {
        category = "Thunderstorm";
    } else if (firstDigit === 3) {
        category = "Drizzle";
    } else if (firstDigit === 5) {
        category = "Rain";
    } else if (firstDigit === 6) {
        category = "Snow";
    } else if (firstDigit === 7) {
        category = "Atmosphere";
    } else if (firstDigit === 8) {
        category = "Clouds";
    }
    const iconPath = weatherIcons[category]
    const styles = {
        card: {
            margin: "3px",
            position: "relative"
        },
        icon: {
            position: "absolute",
            top: 10,
            right: 10,
            width: "50px", // Adjust the width as needed
            height: "50px", // Adjust the height as needed
        },
    }
    return (
        <Card style={styles.card}>
            <div className='gradient'>
                <div className='glass'>
                    {iconPath && <img src={iconPath} alt={category} style={styles.icon} />}
                    <Card.Body>
                        <Card.Title>
                            {props.temp}°F
                        </Card.Title>
                        {/* <Card.Text>
                            {props.temp}°F
                        </Card.Text> */}
                        {/* <Card.Text>
                            Condition: {props.main}
                        </Card.Text> */}
                        <Card.Text>
                        {props.description}
                        </Card.Text>
                    </Card.Body>
                    {/* <h4>Weather Information</h4>
                    <p>Temperature: {props.temp}°F</p>
                    <p>Condition: {props.main}</p>
                    <p>{props.description}</p> */}
                </div>
            </div>  
        </Card>
                    
    )
}