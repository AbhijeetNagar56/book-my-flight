import { useState } from "react";
import SeatModal from "./SeatModal";

interface FlightCardProps {
    flight: {
        _id: string;
        flight_no: string;
        source_airport: string;
        destination_airport: string;
        departure_time: string;
        arrival_time: string;
    };
}

export default function FlightCard({ flight }: FlightCardProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="card bg-base-200 shadow-lg border border-base-300">
                <div className="card-body">
                    <div className="flex justify-between items-center">
                        <h2 className="card-title text-primary">{flight.flight_no}</h2>
                        <div className="badge badge-outline font-semibold">
                            {flight.source_airport} → {flight.destination_airport}
                        </div>
                    </div>

                    <div className="space-y-1 my-3 text-sm">
                        <p><span className="font-medium text-base-content/70">Departure:</span> {new Date(flight.departure_time).toLocaleString()}</p>
                        <p><span className="font-medium text-base-content/70">Arrival:</span> {new Date(flight.arrival_time).toLocaleString()}</p>
                    </div>

                    <div className="card-actions justify-end">
                        <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
                            View Seats
                        </button>
                    </div>
                </div>
            </div>

            {open && (
                <SeatModal
                    flightId={flight._id} // Correctly passing down MongoDB target _id string string
                    onClose={() => setOpen(false)}
                />
            )}
        </>
    );
}