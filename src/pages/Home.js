import debounce from "lodash.debounce";
import { useEffect, useState } from "react";
import Form from "react-bootstrap/Form";

export default function Home(){
    const [restaurantResults, setRestaurantResults] = useState([]);

    useEffect(() => {
        // navigator.geolocation.getCurrentPosition(function(position) {
        //   // console.log("Latitude is :", position.coords.latitude);
        //   // console.log("Longitude is :", position.coords.longitude);
        // });
  
        
    },[])

    const handleRestaurantChange = debounce((event) => {
        const query = event.target.value;

        if(query !== "" && query.length > 3) {
            fetch(`https://services1.arcgis.com/79kfd2K6fskCAkyg/arcgis/rest/services/Louisville_Metro_KY_Restaurant_Inspection_Scores/FeatureServer/0/query?f=json&where=(EstablishmentName LIKE '%25${query}%25' OR Address LIKE '%25${query}%25')&outFields=*`)
            .then(data => (data.json()))
            .then(json => {
                console.log(json.features)
                if(json.features) {
                    const data = json.features.reduce((result, restaurant) => {
                        let i = result.findIndex(f => {return f.id == restaurant.attributes.EstablishmentID});

                        if(i > -1) {
                            const res = result.map((r, index) => {
                                if(i == index) {
                                    r.inspections.push({
                                        id: restaurant.attributes.InspectionID,
                                        score: restaurant.attributes.score,
                                        grade: restaurant.attributes.Grade,
                                        date: new Date(restaurant.attributes.InspectionDate),
                                        type: restaurant.attributes.Ins_TypeDesc
                                    })
                                }

                                return r;
                            })
                            return res
                        } else {
                            return [...result,{
                                id: restaurant.attributes.EstablishmentID,
                                name: restaurant.attributes.EstablishmentName,
                                address: restaurant.attributes.Address,
                                inspections: [{
                                    id: restaurant.attributes.InspectionID,
                                    score: restaurant.attributes.score,
                                    grade: restaurant.attributes.Grade,
                                    date: new Date(restaurant.attributes.InspectionDate),
                                    type: restaurant.attributes.Ins_TypeDesc
                                }
                                ]
                            }]

                        }
                        
                        
                    }, []);

                    setRestaurantResults(data);
                }
            })
        } else {
            setRestaurantResults([]);
        }

    },600)
    
    return <div>
        <Form.Group className="mb-3" controlId="formRestaurant">
        <Form.Label>Search for a restaurant</Form.Label>
        <Form.Control type="email" placeholder="Enter name or address" onChange={handleRestaurantChange}/>
        <Form.Text className="text-muted">
          You can either enter the restaurant name or address
        </Form.Text>
      </Form.Group>

       <div>
            {restaurantResults && restaurantResults.map(restaurant => (<div>
                {restaurant.name}
                
                    Address: {restaurant.address}
                
            </div>))}
        
       </div>
    </div>
}