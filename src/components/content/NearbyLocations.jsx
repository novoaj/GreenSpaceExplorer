import Location from "./Location";
import { ScrollView } from "@aws-amplify/ui-react";
import { useEffect, useState } from "react";
import { Loader } from '@aws-amplify/ui-react';
import { Row, Col } from "react-bootstrap";
import WeatherTile from "./WeatherTile";
import StarRating from "./StarRating";

// https://developers.google.com/maps/documentation/javascript/load-maps-js-api#dynamic-library-import
// https://developers.google.com/maps/documentation/javascript/places
//https://ui.docs.amplify.aws/

// Function to capitalize the first letter of each word
function capitalizeWords(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export default function NearbyLocations(props) {
    const [data, setData] = useState(null);
    const [weather, setWeather] = useState(null);
    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const weatherKey = process.env.REACT_APP_WEATHER_KEY;

    useEffect(() => {
        async function fetchPlacesAndWeather() {
            try {
                // Fetch places data
                setData(props.parks) // mapScreen already fetched, use data in this component
    
                // Fetch weather data
                const weatherResponse = await fetch(`/weather?lat=${props.coords.lat}&lon=${props.coords.lng}`);
                const weatherData = await weatherResponse.json();
                if (!weatherResponse.ok) {
                    throw new Error(`HTTP error: ${weatherResponse.status}`);
                }
                setWeather(weatherData);
            } catch (err) {
                console.error("Error fetching data", err);
            }
        }
    
        if (props.coords.lat !== undefined && props.coords.lng !== undefined) {
            fetchPlacesAndWeather();
        }
    }, [props.coords, props.parks]);

    return (
        <ScrollView style={styles.scrollView} height="500px" maxHeight="100%" width="500px" maxWidth="100%">
            {data === null ? (
                <Loader size="large" />
            ) : (
                <Row style={styles.locationView} xs={1}>
                    {weather && (
                        <Col>
                            <WeatherTile 
                                temp={weather.main.temp} 
                                main={weather.weather[0].main} 
                                description={capitalizeWords(weather.weather[0].description)} 
                                id={weather.weather[0].id}/>
                        </Col>
                    )}
                    {data.map((park, index) => (
                        <Col key={index}>
                            <Location name={park.name} address={park.address} place_id={park.place_id} />
                        </Col>
                    ))}
                </Row>
            )}
        </ScrollView>
    );
}

const styles = {
    scrollView: {
        backgroundColor: "#eff0f0",
        justifyContent: "center",
    },
    locationView: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "stretch"
    }
}
