import { useEffect, useState } from "react";
import api from "./Api";
import toast from "react-hot-toast";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Plane,
    ArrowLeft
} from "lucide-react";

import { Link } from 'react-router';

// Explicit TypeScript interface declarations for safety
interface UserProfile {
    username: string;
    email: string;
    mobile: string;
    gender: string;
    date_of_birth: string;
}

interface Booking {
    _id: string; // Updated for MongoDB ObjectId strings
    seat_no: string;
    booking_date: string;
    status: string;
    flight_id: {
        flight_no: string;
        source_airport: string;
        destination_airport: string;
        departure_time: string;
    };
}
// const navigate = useNavigate();
export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile>({
        username: "",
        email: "",
        mobile: "",
        gender: "",
        date_of_birth: ""
    });
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            await Promise.all([loadProfile(), loadBookings()]);
            setLoading(false);
        };
        loadInitialData();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await api.get("/user/profile");
            
            // FIX: If res.data.user is null, fallback to an empty object structure
            setUser(res.data.user || {
                username: "",
                email: "",
                mobile: "",
                gender: "",
                date_of_birth: ""
            });
        } catch (err) {
            toast.error("Unable to load profile");
        }
    };

    const loadBookings = async () => {
        try {
            const res = await api.get("/user/bookings/me");
            setBookings(res.data.bookings);
        } catch {
            toast.error("Unable to load bookings");
        }
    };

    const saveProfile = async () => {
        try {
            // Note: If you add an implementation for PUT '/auth/profile' on your backend later, 
            // this matches the payload structure perfectly.
            await api.put("/user/profile", {
                username: user.username,
                mobile: user.mobile
            });
            toast.success("Profile updated");
        } catch {
            toast.error("Update failed");
        }
    };

    const cancelBooking = async (bookingId: string) => {
        try {
            await api.delete(`/user/bookings/${bookingId}`);
            toast.success("Booking cancelled");
            loadBookings(); // Hot-reload active reservations list
        } catch (err: any) {
            toast.error(err.response?.data?.msg || "Unable to cancel booking");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-10">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    

    return (
        <div className="max-w-6xl mx-auto p-6">
            
            <h1 className="text-4xl font-bold mb-6"><Link to="/home"><ArrowLeft className="inline mr-5" /></Link> My Profile</h1>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="card bg-base-200 shadow-xl border border-base-300">
                        <div className="card-body">
                            <div className="flex justify-center">
                                <div className="avatar placeholder">
                                    <div className="bg-primary text-primary-content rounded-full w-20 flex items-center justify-center">
                                        <User size={32} />
                                    </div>
                                </div>
                            </div>

                            <label className="label text-xs uppercase tracking-wider opacity-60">Name</label>
                            <label className="input input-bordered flex items-center gap-2">
                                <User size={16} />
                                <input
                                    type="text"
                                    className="grow"
                                    value={user.username || ""}
                                    onChange={(e) => setUser({ ...user, username: e.target.value })}
                                />
                            </label>

                            <label className="label text-xs uppercase tracking-wider opacity-60">Email</label>
                            <label className="input input-bordered flex items-center gap-2 bg-base-300">
                                <Mail size={16} />
                                <input disabled className="grow" value={user.email || ""} />
                            </label>

                            <label className="label text-xs uppercase tracking-wider opacity-60">Mobile</label>
                            <label className="input input-bordered flex items-center gap-2">
                                <Phone size={16} />
                                <input
                                    type="text"
                                    className="grow"
                                    value={user.mobile || ""}
                                    onChange={(e) => setUser({ ...user, mobile: e.target.value })}
                                />
                            </label>

                            <label className="label text-xs uppercase tracking-wider opacity-60">DOB</label>
                            <label className="input input-bordered flex items-center gap-2 bg-base-300">
                                <Calendar size={16} />
                                <input
                                    disabled
                                    className="grow"
                                    value={user.date_of_birth ? user.date_of_birth.slice(0, 10) : "Not Specified"}
                                />
                            </label>

                            <button onClick={saveProfile} className="btn btn-primary mt-6">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* Booking History */}
                <div className="lg:col-span-2">
                    <div className="card bg-base-200 shadow-xl border border-base-300">
                        <div className="card-body">
                            <h2 className="card-title text-2xl mb-4 gap-2 text-primary">
                                <Plane size={24} />
                                Booking History
                            </h2>

                            {bookings.length === 0 ? (
                                <div className="alert bg-base-100 border border-base-300">
                                    <span>No active or past flight reservations found.</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map((booking) => (
                                        <div
                                            key={booking._id}
                                            className="border border-base-300 bg-base-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="space-y-1">
                                                    <span className="badge badge-primary font-bold">
                                                        {booking.flight_id?.flight_no || "N/A"}
                                                    </span>
                                                    <h3 className="font-black text-xl pt-1">
                                                        {booking.flight_id?.source_airport} → {booking.flight_id?.destination_airport}
                                                    </h3>
                                                    <p className="text-sm text-base-content/70">
                                                        <span className="font-semibold">Departure:</span>{" "}
                                                        {booking.flight_id?.departure_time 
                                                            ? new Date(booking.flight_id.departure_time).toLocaleString() 
                                                            : "N/A"}
                                                    </p>
                                                    <div className="flex gap-4 text-xs font-medium pt-2 text-base-content/60">
                                                        <p>Seat: <span className="text-base-content font-bold">{booking.seat_no}</span></p>
                                                        <p>Date: <span>{new Date(booking.booking_date).toLocaleDateString()}</span></p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`badge uppercase tracking-wider font-bold text-[10px] p-2 mb-4 ${
                                                        booking.status === 'confirmed' ? 'badge-success' : 'badge-error'
                                                    }`}>
                                                        {booking.status}
                                                    </span>
                                                    <br />
                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            className="btn btn-error btn-sm btn-outline"
                                                            onClick={() => cancelBooking(booking._id)}
                                                        >
                                                            Cancel Flight
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}