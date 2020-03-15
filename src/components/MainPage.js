import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import SearchAutoComplete from './SearchAutoComplete';
import MapMarker from './MapMarker';
import CoffeeSearchResult from './CoffeeSearchResult';
import ConstraintSlider from './ConstraintSlider';

import { Button, Input, Divider, message } from 'antd';

const SYD_COOR = { lat: -33.8699, lng: 151.2087 };

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            constraints: [{ name: '', time: 0 }],
            searchResults: [],
            mapsLoaded: false,
            markers: [],
            map: {},
            maps: {},
            sydneyLatLng: {},
            autoCompleteService: {},
            placesService: {},
            geoCoderService: {},
            directionService: {},
        };
    }

    // Update name for constraint with index === key
    updateConstraintName = ((event, key) => {
        event.preventDefault();
        const prevConstraints = this.state.constraints;
        const constraints = Object.assign([], prevConstraints);
        constraints[key].name = event.target.value;
        this.setState({ constraints });
    });

    // Updates distance (in KM) for constraint with index == key
    updateConstraintTime = ((key, value) => {
        const prevConstraints = this.state.constraints;
        const constraints = Object.assign([], prevConstraints);
        constraints[key].time = value;
        this.setState({ constraints });
    });

    // Adds a Marker to the GoogleMaps component
    addMarker = ((lat, lng, name) => {
        const prevMarkers = this.state.markers;
        const markers = Object.assign([], prevMarkers);

        // If name already exists in marker list just replace lat & lng.
        let newMarker = true;
        for (let i = 0; i < markers.length; i++) {
            if (markers[i].name === name) {
                newMarker = false;
                markers[i].lat = lat;
                markers[i].lng = lng;
                message.success(`Updated "${name}" Marker`);
                break;
            }
        }
        // Name does not exist in marker list. Create new marker
        if (newMarker) {
            markers.push({ lat, lng, name });
            message.success(`Added new "${name}" Marker`);
        }

        this.setState({ markers });
    });

    // Runs once when the Google Maps library is ready
    // Initializes all services that we need
    handleApiLoaded = ((map, maps) => {
        this.setState({
            mapsLoaded: true,
            map,
            maps,
            sydneyLatLng: new maps.LatLng(SYD_COOR.lat, SYD_COOR.lng),
            autoCompleteService: new maps.places.AutocompleteService(),
            placesService: new maps.places.PlacesService(map),
            geoCoderService: new maps.Geocoder(),
            directionService: new maps.DirectionsService(),
        });
    });

    // With the constraints, find some places serving coffee
    handleSearch = (() => {
        const { markers, constraints, placesService, directionService, maps } = this.state;
        if (markers.length === 0) {
            message.warn('Fill in blank search bar and try again!');
            return;
        }
        const filteredResults = [];
        const marker = markers[0];
        const timeLimit = constraints[0].time;
        const markerLatLng = new maps.LatLng(marker.lat, marker.lng);

        const placesRequest = {
            location: markerLatLng,
            type: ['cafe'], 
            query: 'coffee',
            rankBy: maps.places.RankBy.DISTANCE, 
        };

        // First, search for coffee shops.
        placesService.textSearch(placesRequest, ((response) => {
            // Only look at the nearest top 10.
            const responseLimit = Math.min(10, response.length);
            for (let i = 0; i < responseLimit; i++) {
                const coffeePlace = response[i];
                const { rating, name } = coffeePlace;
                const address = coffeePlace.formatted_address; // e.g 100 George St,
                const priceLevel = coffeePlace.price_level; // 1, 2, 3...
                let photoUrl = '';
                let openNow = false;
                if (coffeePlace.opening_hours) {
                    openNow = coffeePlace.opening_hours.open_now; // e.g true/false
                }
                if (coffeePlace.photos && coffeePlace.photos.length > 0) {
                    photoUrl = coffeePlace.photos[0].getUrl();
                }

                // Second, For each coffeePlace, check if it is within acceptable travelling distance
                const directionRequest = {
                    origin: markerLatLng,
                    destination: address, // Address of coffee place
                    travelMode: 'WALKING',
                }
                directionService.route(directionRequest, ((result, status) => {
                    if (status !== 'OK') { return }
                    const travellingRoute = result.routes[0].legs[0]; // { duration: { text: 1mins, value: 600 } }
                    const travellingTimeInMinutes = travellingRoute.duration.value / 60;
                    if (travellingTimeInMinutes < timeLimit) {
                        const distanceText = travellingRoute.distance.text; // 6.4km
                        const timeText = travellingRoute.duration.text; // 11 mins
                        filteredResults.push({
                            name,
                            rating,
                            address,
                            openNow,
                            priceLevel,
                            photoUrl,
                            distanceText,
                            timeText,
                        });
                    }
                    // Finally, Add results to state
                    this.setState({ searchResults: filteredResults });
                }));
            }
        }));
    });

    render() {
        const { constraints, mapsLoaded, sydneyLatLng, markers, searchResults } = this.state;
        const { autoCompleteService, geoCoderService } = this.state; // Google Maps Services
        return (
            <flexbox className="w-100 d-flex py-4 flex-wrap justify-content-center">
                {/* <h1 className="w-100 fw-md">Find Coffee</h1> */}
                {/* Constraints section */}
                <section className="col-6">
                    {mapsLoaded ?
                        <div>
                            {constraints.map((constraint, key) => {
                                const { name, time } = constraint;
                                return (
                                    <div key={key} className="mb-4">
                                        <div className="d-flex mb-2">
                                            <Input className="col-4 mr-2" placeholder="Name" onChange={(event) => this.updateConstraintName(event, key)} />
                                            <SearchAutoComplete
                                                autoCompleteService={autoCompleteService}
                                                geoCoderService={geoCoderService}
                                                sydneyLatLng={sydneyLatLng}
                                                markerName={name}
                                                addMarker={this.addMarker}
                                            />
                                        </div>
                                        <ConstraintSlider 
                                             iconType="car"
                                             value={time}
                                             onChange={(value) => this.updateConstraintTime(key, value)}
                                             text="Minutes away by drive"
                                        />
                                        {/* <Divider /> */}
                                    </div>
                                );
                            })}
                        </div>
                        : null
                    }
                </section>
                
                {/* Search Button */}
                <Button className="mt-4 fw-md" type="default" size="default" onClick={this.handleSearch}>Search</Button>

                {/* Maps Section */}
                {/* <section className="col-6 h-lg"> */}
                    <GoogleMapReact
                        bootstrapURLKeys={{
                            key: 'AIzaSyDivRtB90ronhSWEPkwSt8lG-SaVlntvI4',
                            libraries: ['places', 'directions']
                        }}
                        defaultZoom={11}
                        defaultCenter={{ lat: SYD_COOR.lat, lng: SYD_COOR.lng }}
                        yesIWantToUseGoogleMapApiInternals={true}
                        onGoogleApiLoaded={({ map, maps }) => this.handleApiLoaded(map, maps)} 
                    >
                        {/* Pin markers on the Map*/}
                        {markers.map((marker, key) => {
                            const { name, lat, lng } = marker;
                            return (
                                <MapMarker key={key} name={name} lat={lat} lng={lng} />
                            );
                        })}
                    </GoogleMapReact>
                {/* </section> */}

                {/* Results section */}
                {searchResults.length > 0 ?
                    <>
                        <Divider />
                        <section className="col-12">
                            <div className="d-flex flex-column justify-content-center">
                                <h1 className="mb-4 fw-md">10 Coffee shops nearby</h1>
                                <div className="d-flex flex-wrap">
                                    {searchResults.map((result, key) => (
                                        <CoffeeSearchResult info={result} key={key} />
                                    ))}
                                </div>
                            </div>
                        </section>
                    </>
                    : null}
            </flexbox>
        )
    }
}

export default MainPage;