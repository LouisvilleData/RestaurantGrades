import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Table from 'react-bootstrap/Table';
import Button from "react-bootstrap/Button";

export default function Restaurant() {
    const { restaurantID } = useParams();
    const [violations, setViolations] = useState([]);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        fetch(`https://services1.arcgis.com/79kfd2K6fskCAkyg/arcgis/rest/services/Louisville_Metro_KY_Inspection_Violations_of_Failed_Restaurants/FeatureServer/0/query?outFields=*&where=(EstablishmentID = ${restaurantID})&f=json`)
            .then(res => { return res.json() })
            .then(json => {
                const sortedByDate = json.features.sort((a,b) => {
                    if(a.attributes.InspectionDate > b.attributes.InspectionDate) {
                        return -1;
                    } else if (a.attributes.InspectionDate < b.attributes.InspectionDate) {
                        return 1;
                    } else {
                        return 0;
                    }
                })
                setViolations(sortedByDate);
            })
    }, [restaurantID])


    return (<div className="pb-4 px-4 md:pb-8 md:px-8 w-full md:w-3/4 mx-auto relative min-h-screen">

        <div className="bg-white p-4">
            {searchParams.get("prev_search") && <Button href={`/?prev_search=${searchParams.get("prev_search")}`}>Back to results</Button>}
            <h1 className="text-4xl pt-4">{violations && violations.length > 0 && violations[0].attributes.premise_name} Inspection Violation Results</h1>
        </div>

        {violations && violations.length > 0 && <div className="bg-white mt-4 rounded-lg hidden md:block">
            <Table striped bordered hover responsive>
                <thead className="font-bold">
                    <tr>
                        <td>Inspection Date</td>
                        <td>Violation Description</td>
                        <td>Inspection Violation Comments</td>
                        <td>Violation Critical?</td>
                        <td>Score</td>
                    </tr>
                </thead>
                <tbody>
                    {violations.map((violation, index) => {
                        const { EstablishmentID, Insp_Viol_Comments, InspectionDate, ViolationDesc, critical_yn, score } = violation.attributes;
                        const violationDate = new Date(InspectionDate);
                        const formattedDate = `${violationDate.getMonth() + 1}/${violationDate.getDate()}/${violationDate.getFullYear()}`;
                        return EstablishmentID === parseInt(restaurantID) && <tr key={index}>
                            <td>{formattedDate}</td>
                            <td>{ViolationDesc}</td>
                            <td>{Insp_Viol_Comments}</td>
                            <td>{critical_yn}</td>
                            <td>{score}</td>
                        </tr>
                    })}
                </tbody>
            </Table>
        </div>}

        {violations && violations.length > 0 && <div className="bg-white mt-4 rounded-lg md:hidden">
            <div className="py-4">
                {violations.map((violation, index) => {
                    const { EstablishmentID, Insp_Viol_Comments, InspectionDate, ViolationDesc, critical_yn, score } = violation.attributes;
                    const violationDate = new Date(InspectionDate);
                    const formattedDate = `${violationDate.getMonth() + 1}/${violationDate.getDate()}/${violationDate.getFullYear()}`;

                    return EstablishmentID === parseInt(restaurantID) && <div className="mb-4 border-b-8 px-4 pb-4" key={index}>
                        <div className="block mb-2">
                            <span className="font-bold">Inspection Date</span>
                            <p>{formattedDate}</p>
                        </div>

                        <div className="block mb-2">
                            <span className="font-bold">Violation Description</span>
                            <p>{ViolationDesc}</p>
                        </div>

                        <div className="block mb-2">
                            <span className="font-bold">Inspection Violation Comments</span>
                            <p>{Insp_Viol_Comments}</p>
                        </div>

                        <div className="block mb-2">
                            <span className="font-bold">Violation Critical?</span>
                            <p>{critical_yn}</p>
                        </div>

                        <div className="block mb-2">
                            <span className="font-bold">Score</span>
                            <p>{score}</p>
                        </div>
                    </div>
                })}
            </div>

        </div>}

        {violations.length === 0 && <div className="bg-white mt-4 p-4 rounded-lg md:hidden">
            Good News! No violations found for restaurant with ID {restaurantID}.
        </div>} 

    </div>)
}