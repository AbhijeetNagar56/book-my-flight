import { useState } from "react";
import SeatModal from "./SeatModal";

export default function FlightCard({
    flight
}: any) {

    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="card bg-base-200 shadow-lg">

                <div className="card-body">

                    <h2 className="card-title">
                        {flight.flight_no}
                    </h2>

                    <p>
                        {flight.source_airport}
                        {" → "}
                        {flight.destination_airport}
                    </p>

                    <p>
                        Departure:
                        {" "}
                        {new Date(
                            flight.departure_time
                        ).toLocaleString()}
                    </p>

                    <p>
                        Arrival:
                        {" "}
                        {new Date(
                            flight.arrival_time
                        ).toLocaleString()}
                    </p>

                    <div className="card-actions justify-end">

                        <button
                            className="btn btn-primary"
                            onClick={() =>
                                setOpen(true)
                            }
                        >
                            View Seats
                        </button>

                    </div>

                </div>

            </div>

            {open && (
                <SeatModal
                    flightId={flight.id}
                    onClose={() =>
                        setOpen(false)
                    }
                />
            )}
        </>
    );
}