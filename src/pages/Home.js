import debounce from "lodash.debounce";
import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";
import Spinner from 'react-bootstrap/Spinner';
import Button from "react-bootstrap/Button";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Home() {
    const [restaurantResults, setRestaurantResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");

    const navigate = useNavigate();
    console.log(searchParams)
    useEffect(() => {
        if(searchParams.get("prev_search")) {
            setSearchQuery(searchParams.get("prev_search"));
            setLoading(true);
            fetch(`https://services1.arcgis.com/79kfd2K6fskCAkyg/arcgis/rest/services/Louisville_Metro_KY_Restaurant_Inspection_Scores/FeatureServer/0/query?f=json&where=(EstablishmentName LIKE '%25${encodeURI(searchParams.get("prev_search"))}%25' OR Address LIKE '%25${encodeURI(searchParams.get("prev_search"))}%25')&outFields=*`)
            .then(data => (data.json()))
            .then(json => {
                setLoading(false);
                groupRestaurants(json);
            })
        }
        // navigator.geolocation.getCurrentPosition(function(position) {
        //   // console.log("Latitude is :", position.coords.latitude);
        //   // console.log("Longitude is :", position.coords.longitude);
        // });


    }, [searchParams])

    const handleRestaurantChange = debounce((event) => {
        const query = event.target.value;
        setSearchQuery(query);

        if (query !== "" && query.length > 2) {
            setLoading(true);
            fetch(`https://services1.arcgis.com/79kfd2K6fskCAkyg/arcgis/rest/services/Louisville_Metro_KY_Restaurant_Inspection_Scores/FeatureServer/0/query?f=json&where=(EstablishmentName LIKE '%25${encodeURI(query)}%25' OR Address LIKE '%25${encodeURI(query)}%25')&outFields=*`)
                .then(data => (data.json()))
                .then(json => {
                    setLoading(false);
                    groupRestaurants(json);
                })
        } else {
            setRestaurantResults([]);
            setLoading(false);
        }

    }, 600)

    function groupRestaurants(json) {
        if (json.features) {
            const data = json.features.reduce((result, restaurant) => {
                let i = result.findIndex(f => { return f.id === restaurant.attributes.EstablishmentID; });

                if (i > -1) {
                    const res = result.map((r, index) => {
                        if (i === index) {
                            r.inspections.push({
                                id: restaurant.attributes.InspectionID,
                                score: restaurant.attributes.score,
                                grade: restaurant.attributes.Grade,
                                date: new Date(restaurant.attributes.InspectionDate),
                                type: restaurant.attributes.Ins_TypeDesc
                            });
                        }

                        return r;
                    });
                    return res;
                } else {
                    return [...result, {
                        id: restaurant.attributes.EstablishmentID,
                        name: restaurant.attributes.EstablishmentName,
                        address: restaurant.attributes.Address,
                        city: restaurant.attributes.City,
                        inspections: [{
                            id: restaurant.attributes.InspectionID,
                            score: restaurant.attributes.score,
                            grade: restaurant.attributes.Grade,
                            date: new Date(restaurant.attributes.InspectionDate),
                            type: restaurant.attributes.Ins_TypeDesc
                        }
                        ]
                    }];

                }


            }, []);
            setRestaurantResults(data);
        }
    }

    return <div className="bg-gray-200 min-h-screen">
        <div className="bg-white">
        <div className="p-4 md:p-8 w-full md:w-3/4 mx-auto">
        <h1 className="text-4xl">Louisville Restaurant Grades</h1>
        <div className="bg-white rounded-md mt-4">
            <Form.Group className="mb-3" controlId="formRestaurant">
                <Form.Label>Search for a restaurant</Form.Label>
                <Form.Control type="search" placeholder="Enter restaurant name or address" onChange={handleRestaurantChange} />
                <Form.Text className="text-muted">
                    You can either enter the restaurant name or address
                </Form.Text>
            </Form.Group>
        </div>
        </div>
        </div>

    <div className="p-4 md:p-8 w-full md:w-3/4 mx-auto relative">
        {loading && <div className="px-40 pb-40 pt-20 w-32 mx-auto"><Spinner animation="border" size="lg" className="w-32 h-32" /></div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {restaurantResults && restaurantResults.map(restaurant => (
                <div key={restaurant.id} className="flex flex-column relative bg-white font-semibold rounded-md border shadow-lg w-full">
                   {!process.env.NODE_ENV || process.env.NODE_ENV === 'development' ?
                    <img className="w-full rounded-t-md mx-auto" src={`https://picsum.photos/300/150?random=${restaurant.id}`} alt="" />:
                    <img className="w-full rounded-t-md mx-auto" src={`https://maps.googleapis.com/maps/api/streetview?key=${process.env.REACT_APP_GCP_API}&location=${restaurant.name} ${restaurant.address} ${restaurant.city}&size=300x200`} alt="" />}
                    <div className="p-4">
                        <h1 className="text-lg text-gray-700 text-center">{restaurant.name}</h1>
                        <h3 className="text-sm text-gray-500 text-center">{restaurant.address}</h3>
                        <h4 className="block w-full text-center mt-2">Inspections:</h4>
                        <table className="m-0 p-0 w-full text-xs xl:text-base text-center xl:text-left">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Score</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {restaurant.inspections && restaurant.inspections.sort((a,b) => {
                                    if(a.date > b.date) return -1;
                                    if(a.date < b.date) return 1;
                                    return 0;
                                }).map((inspection, index) => (
                                    <tr key={index} className="">
                                        <td>{`${inspection.date.getMonth() + 1}/${inspection.date.getDate()}/${inspection.date.getFullYear()}`}</td>
                                        <td>{inspection.type}</td>
                                        <td>{inspection.score !== 0 ? inspection.score : "N/A"}</td>
                                        <td>{inspection.grade ? inspection.grade : "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <Button className="w-full mt-4" href="" onClick={() => {navigate(`restaurant/${restaurant.id}?prev_search=${searchQuery}`)}} variant="primary">Check Violations</Button>
                    </div>
                    <div className="bg-gray-200 px-4 py-1 w-full mt-auto">
                        <span className="text-gray-600">
                            <i className="fa-solid fa-circle-info"></i> Permit Number: <span className="text-black">{restaurant.id}</span>
                        </span>
                    </div>
                </div>
            ))}

        </div>
    </div>
    </div>
}