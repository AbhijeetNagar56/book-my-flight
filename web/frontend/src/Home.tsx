import { useState } from "react";
import api from "./Api";
import toast from "react-hot-toast";
import { Plane, MapPin, Calendar } from "lucide-react";
import FlightCard from './FlightCard';
import { useNavigate } from 'react-router';

// Updated interface to expect string '_id' from MongoDB instead of numeric 'id'
interface Flight {
    _id: string; 
    flight_no: string;
    source_airport: string;
    destination_airport: string;
    departure_time: string;
    arrival_time: string;
}

export default function Home() {
    const navigate = useNavigate();
    const [src, setSrc] = useState("");
    const [dst, setDst] = useState("");
    const [date, setDate] = useState("");

    const [flights, setFlights] = useState<Flight[]>([]);
    const [loading, setLoading] = useState(false);

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().slice(0, 10);
    };

    const searchFlights = async () => {
        if (!src || !dst || !date) {
            return toast.error("Please fill in all search parameters");
        }

        const minDate = getTomorrowDate();
        if (date < minDate) {
            return toast.error("Please select a future date at least one day from today");
        }

        try {
            setLoading(true);
            const res = await api.get("/airport/flights", {
                params: { src, dst, date }
            });

            const earliestDeparture = new Date(Date.now() + 5 * 60 * 60 * 1000);
            const validFlights = res.data.flights.filter((flight: Flight) => {
                return new Date(flight.departure_time) > earliestDeparture;
            });

            setFlights(validFlights);

            if (validFlights.length === 0) {
                toast("No flights available after the 5-hour booking cutoff");
            }
        } catch (err) {
            console.error(err);
            toast.error("Unable to fetch flights");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-100 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">Book My <span className="text-primary">Flight</span><button className="inline float-right btn btn-secondary" onClick={()=>{ navigate('/profile') }}>Profile</button></h1>
                <p className="text-base-content/60 mb-8">Search and book flights instantly</p>
                
                {/* Search Card */}
                <div className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                        <div className="grid md:grid-cols-4 gap-4">
                            <label className="input input-bordered flex items-center gap-2">
                                <MapPin size={18} />
                                <input
                                    type="text"
                                    placeholder="Source (DEL)"
                                    className="grow"
                                    value={src}
                                    onChange={(e) => setSrc(e.target.value.toUpperCase())}
                                />
                            </label>

                            <label className="input input-bordered flex items-center gap-2">
                                <Plane size={18} />
                                <input
                                    type="text"
                                    placeholder="Destination (BOM)"
                                    className="grow"
                                    value={dst}
                                    onChange={(e) => setDst(e.target.value.toUpperCase())}
                                />
                            </label>

                            <label className="input input-bordered flex items-center gap-2">
                                <Calendar size={18} />
                                <input
                                    type="date"
                                    className="grow"
                                    min={getTomorrowDate()}
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </label>

                            <button
                                className="btn btn-primary"
                                onClick={searchFlights}
                                disabled={loading}
                            >
                                {loading ? "Searching..." : "Search"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Flights List */}
                {flights.length > 0 && (
                    <div className="mt-10">
                        <h2 className="text-2xl font-semibold mb-5">Available Flights</h2>
                        <div className="grid md:grid-cols-2 gap-5">
                            {flights.map((flight) => (
                                <FlightCard
                                    key={flight._id} // Using MongoDB _id
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