import React, { useState, useEffect, useContext, useRef } from 'react';
import { Col, Row } from 'react-bootstrap';
import { Loader } from '@googlemaps/js-api-loader';
import { LocationContext } from '../context/LocationContext';
import NearbyLocations from './NearbyLocations';

export default function MapScreen(props) {
    const [location, setLocation] = useContext(LocationContext);
    const [coords, setCoords] = useState({
        lat: undefined,
        lng: undefined,
    });
    const [parks, setParks] = useState([]);
    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const mapRef = useRef(null);
    const loader = new Loader({
        apiKey: key,
        version: 'weekly',
    });

    const fetchZoomLevel = async (radius) => {
        try {
            const response = await fetch(`/calculate_zoom?radius=${radius}`);
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            return data.zoom;
        } catch (error) {
            console.error("Error fetching zoom level", error);
            return null;  
        }
    };

    const fetchParks = async () => {
        if (coords.lat !== undefined && coords.lng !== undefined) {
            try {
                const response = await fetch(`/nearby_parks`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        lat: coords.lat,
                        lng: coords.lng,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const data = await response.json();
                setParks(data);
            } catch (error) {
                console.error('Error fetching parks data', error);
            }
        }
    };

    useEffect(() => {
        fetchParks();
    }, [coords]);

    useEffect(() => {
        props.onInMapChange(true);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${key}`);
                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }
                const data = await response.json();
                setCoords(data.results[0].geometry.location);
            } catch (error) {
                console.error('Error fetching data ', error);
            }
        };
        if (location !== '') {
            fetchData();
        }
    }, [location]);

    const loadMap = async () => {
        if (coords.lat !== undefined && coords.lng !== undefined) {
            const zoomLevel = await fetchZoomLevel(3000); // Example radius of 3000 meters
            if (zoomLevel !== null) {
                loader.load().then(() => {
                    const map = new window.google.maps.Map(mapRef.current, {
                        center: { lat: coords.lat, lng: coords.lng },
                        zoom: zoomLevel,
                        disableDefaultUI: true,
                        styles: [
                            {
                                featureType: "poi",
                                elementType: "all",
                                stylers: [{ visibility: "off" }],
                            },
                            {
                                featureType: "transit",
                                elementType: "all",
                                stylers: [{ visibility: "off" }],
                            }
                        ],
                        scrollwheel: false, // Disable zooming with mouse wheel
                        gestureHandling: 'none', // Disable panning and zooming gestures
                    });

                    // Marker for the user-specified location
                    const userLocationMarker = new window.google.maps.Marker({
                        position: { lat: coords.lat, lng: coords.lng },
                        map: map,
                        icon: {
                            url: '/starting_icon.png',
                            scaledSize: new window.google.maps.Size(50, 50),
                        },
                        title: "Your Location"
                    });

                    // Create an InfoWindow for the user location marker
                    const userLocationInfoWindow = new window.google.maps.InfoWindow({
                        content: '<div><strong>Your Location</strong></div>'
                    });

                    // Add a click listener to the user location marker to open the InfoWindow
                    userLocationMarker.addListener('click', () => {
                        userLocationInfoWindow.open(map, userLocationMarker);
                    });

                    parks.forEach((park) => {
                        const marker = new window.google.maps.Marker({
                            position: { lat: park.location.lat, lng: park.location.lng },
                            map: map,
                            icon: {
                                url: '/green_icon.png',
                                scaledSize: new window.google.maps.Size(60, 60),
                            },
                        });

                        const infoWindow = new window.google.maps.InfoWindow({
                            content: `<div><strong>${park.name}</strong></div>`,
                        });

                        marker.addListener('click', () => {
                            infoWindow.open(map, marker);
                        });
                    });
                });
            }
        }
    };
    
    useEffect(() => {
        loadMap();
    }, [parks, coords]);

    return (
        <Row>
            <Col xs={12} sm={7} md={8} lg={8} xl={8} className="mx-auto d-flex align-items-center pt-3">
                <div ref={mapRef} id="map" style={{ height: '500px', width: '100%' }}></div>
            </Col>
            <Col style={styles.searchResults} xs={12} sm={5} md={4} lg={4} xl={4}>
                <NearbyLocations coords={coords} parks={parks} />
            </Col>
        </Row>
    );
}

const styles = {
    searchResults: {
        backgroundColor: "#f1f2f2",
        padding: "10px",
        borderRadius: "10px",
    },
};
