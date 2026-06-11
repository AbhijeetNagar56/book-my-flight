import { useEffect, useState } from "react";
import api from "./Api";
import toast from "react-hot-toast";
import {
    User,
    Mail,
    Phone,
    Calendar,
    Plane
} from "lucide-react";

export default function Profile() {

    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState({
        username: "",
        email: "",
        mobile: "",
        gender: "",
        date_of_birth: ""
    });

    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        loadProfile();
        loadBookings();
    }, []);

    const loadProfile = async () => {
        try {

            const res = await api.get(
                "/auth/profile"
            );

            setUser(res.data.user);

        } catch {

            toast.error(
                "Unable to load profile"
            );

        } finally {
            setLoading(false);
        }
    };

    const loadBookings = async () => {
        try {

            const res = await api.get(
                "/bookings/me"
            );

            setBookings(
                res.data.bookings
            );

        } catch {

            toast.error(
                "Unable to load bookings"
            );
        }
    };

    const saveProfile = async () => {

        try {

            await api.put(
                "/auth/profile",
                {
                    username:
                        user.username,
                    mobile:
                        user.mobile
                }
            );

            toast.success(
                "Profile updated"
            );

        } catch {

            toast.error(
                "Update failed"
            );
        }
    };

    const cancelBooking = async (
        bookingId: number
    ) => {

        try {

            await api.delete(
                `/bookings/${bookingId}`
            );

            toast.success(
                "Booking cancelled"
            );

            loadBookings();

        } catch {

            toast.error(
                "Unable to cancel"
            );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center mt-10">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">

            <h1 className="text-4xl font-bold mb-6">
                My Profile
            </h1>

            <div className="grid lg:grid-cols-3 gap-6">

                {/* Profile Card */}

                <div className="lg:col-span-1">

                    <div className="card bg-base-200 shadow-xl">

                        <div className="card-body">

                            <div className="flex justify-center">

                                <div className="avatar placeholder">

                                    <div className="bg-primary text-primary-content rounded-full w-20">

                                        <User size={32} />

                                    </div>

                                </div>

                            </div>

                            <label className="label">
                                Name
                            </label>

                            <label className="input input-bordered flex items-center gap-2">

                                <User size={16} />

                                <input
                                    type="text"
                                    value={
                                        user.username
                                    }
                                    onChange={(e) =>
                                        setUser({
                                            ...user,
                                            username:
                                                e.target
                                                    .value
                                        })
                                    }
                                />

                            </label>

                            <label className="label">
                                Email
                            </label>

                            <label className="input input-bordered flex items-center gap-2">

                                <Mail size={16} />

                                <input
                                    disabled
                                    value={
                                        user.email
                                    }
                                />

                            </label>

                            <label className="label">
                                Mobile
                            </label>

                            <label className="input input-bordered flex items-center gap-2">

                                <Phone size={16} />

                                <input
                                    value={
                                        user.mobile
                                    }
                                    onChange={(e) =>
                                        setUser({
                                            ...user,
                                            mobile:
                                                e.target
                                                    .value
                                        })
                                    }
                                />

                            </label>

                            <label className="label">
                                DOB
                            </label>

                            <label className="input input-bordered flex items-center gap-2">

                                <Calendar size={16} />

                                <input
                                    disabled
                                    value={
                                        user.date_of_birth?.slice(
                                            0,
                                            10
                                        )
                                    }
                                />

                            </label>

                            <button
                                onClick={
                                    saveProfile
                                }
                                className="btn btn-primary mt-4"
                            >
                                Save Changes
                            </button>

                        </div>

                    </div>

                </div>

                {/* Booking History */}

                <div className="lg:col-span-2">

                    <div className="card bg-base-200 shadow-xl">

                        <div className="card-body">

                            <h2 className="card-title text-2xl mb-4">

                                <Plane />

                                Booking History

                            </h2>

                            {bookings.length === 0 && (
                                <div className="alert">
                                    No bookings yet
                                </div>
                            )}

                            <div className="space-y-4">

                                {bookings.map(
                                    (
                                        booking: any
                                    ) => (

                                        <div
                                            key={
                                                booking.id
                                            }
                                            className="border border-base-300 rounded-xl p-4"
                                        >

                                            <div className="flex justify-between items-center">

                                                <div>

                                                    <h3 className="font-bold text-lg">

                                                        {
                                                            booking.flight_no
                                                        }

                                                    </h3>

                                                    <p>

                                                        {
                                                            booking.source_airport
                                                        }

                                                        {" → "}

                                                        {
                                                            booking.destination_airport
                                                        }

                                                    </p>

                                                    <p>

                                                        Seat:
                                                        {" "}
                                                        {
                                                            booking.seat_no
                                                        }

                                                    </p>

                                                    <p>

                                                        Class:
                                                        {" "}
                                                        {
                                                            booking.seat_class
                                                        }

                                                    </p>

                                                    <p>

                                                        ₹
                                                        {
                                                            booking.price
                                                        }

                                                    </p>

                                                </div>

                                                <div className="text-right">

                                                    <div className="badge badge-success mb-2">

                                                        {
                                                            booking.status
                                                        }

                                                    </div>

                                                    <br />

                                                    <button
                                                        className="btn btn-error btn-sm"
                                                        onClick={() =>
                                                            cancelBooking(
                                                                booking.id
                                                            )
                                                        }
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}