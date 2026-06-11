import { useState } from "react";
import api from "./Api";
import toast from "react-hot-toast";
import {
    Plane,
    MapPin,
    Calendar
} from "lucide-react";

import FlightCard from './FlightCard'

interface Flight {
    id: number;
    flight_no: string;
    source_airport: string;
    destination_airport: string;
    departure_time: string;
    arrival_time: string;
}

export default function Home() {
    const [src, setSrc] = useState("");
    const [dst, setDst] = useState("");
    const [date, setDate] = useState("");

    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);

    const searchFlights = async () => {
        try {

            setLoading(true);

            const res = await api.get("/flights", {
                params: {
                    src,
                    dst,
                    date
                }
            });

            setFlights(res.data.flights);

            if (res.data.flights.length === 0) {
                toast("No flights found");
            }

        } catch (err) {

            toast.error("Unable to fetch flights");

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 p-6">

            <div className="max-w-6xl mx-auto">

                <h1 className="text-4xl font-bold mb-2">
                    Find Your Flight
                </h1>

                <p className="text-base-content/60 mb-8">
                    Search and book flights instantly
                </p>

                {/* Search Card */}

                <div className="card bg-base-200 shadow-xl">

                    <div className="card-body">

                        <div className="grid md:grid-cols-4 gap-4">

                            <label className="input input-bordered flex items-center gap-2">

                                <MapPin size={18} />

                                <input
                                    type="text"
                                    placeholder="Source (DEL)"
                                    value={src}
                                    onChange={(e) =>
                                        setSrc(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>

                            <label className="input input-bordered flex items-center gap-2">

                                <Plane size={18} />

                                <input
                                    type="text"
                                    placeholder="Destination (BOM)"
                                    value={dst}
                                    onChange={(e) =>
                                        setDst(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>

                            <label className="input input-bordered flex items-center gap-2">

                                <Calendar size={18} />

                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) =>
                                        setDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </label>

                            <button
                                className="btn btn-primary"
                                onClick={searchFlights}
                                disabled={loading}
                            >
                                {loading
                                    ? "Searching..."
                                    : "Search"}
                            </button>

                        </div>

                    </div>

                </div>

                {/* Flights */}

                {flights.length > 0 && (

                    <div className="mt-10">

                        <h2 className="text-2xl font-semibold mb-5">
                            Available Flights
                        </h2>

                        <div className="grid md:grid-cols-2 gap-5">

                            {flights.map((flight) => (

                                <FlightCard
                                    key={flight.id}
                                    flight={flight}
                                />

                            ))}

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
}