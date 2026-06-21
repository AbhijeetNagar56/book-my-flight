import { useEffect, useState } from "react";
import api from "./Api";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface SeatCategory {
    _id: string;
    seat_class: 'economy' | 'premium_economy' | 'business' | 'first_class';
    price: number;
    available_count: number;
    status: 'available' | 'sold_out';
}

interface SeatModalProps {
    flightId: string;
    onClose: () => void;
}

export default function SeatModal({ flightId, onClose }: SeatModalProps) {
    const [seatCategories, setSeatCategories] = useState<SeatCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<SeatCategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/airport/flights/${flightId}/seats`);
                setSeatCategories(res.data.seats);
            } catch (err: any) {
                toast.error(err.response?.data?.msg || "Could not load seats");
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchSeats();
    }, [flightId, onClose]);

    const handleBookSeat = async () => {
        if (!selectedCategory) return;
        
        try {
            setBookingLoading(true);
            const res = await api.post("/user/bookings", {
                flight_id: flightId,
                seat_class: selectedCategory.seat_class
            });

            if (res.data.success) {
                toast.success(`Your ${selectedCategory.seat_class.replace('_', ' ')} seat is confirmed!`);
                onClose();
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.msg || "Booking transaction failed");
        } finally {
            setBookingLoading(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl bg-base-200 border border-base-300">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl">Seat Availability</h3>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center my-10">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="grid gap-4">
                            {seatCategories.map((category) => (
                                <div
                                    key={category._id}
                                    className="flex flex-col gap-3 p-4 rounded-xl border border-base-300 bg-base-100"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold capitalize">{category.seat_class.replace('_', ' ')}</p>
                                            <p className="text-sm text-base-content/70">{category.available_count} seats available</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-semibold ${category.status === 'available' ? 'text-success' : 'text-error'}`}>
                                                {category.status === 'available' ? 'Available' : 'Sold out'}
                                            </p>
                                            <p className="text-sm font-black text-secondary">${category.price}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={category.available_count === 0}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`btn btn-sm ${category.available_count === 0 ? 'btn-disabled' : 'btn-primary'}`}
                                    >
                                        {category.available_count === 0 ? 'Unavailable' : 'Book this Class'}
                                    </button>
                                </div>
                            ))}
                        </div>

                        {selectedCategory && (
                            <div className="bg-base-100 p-4 rounded-xl flex flex-col gap-4 border border-base-300">
                                <div>
                                    <p className="text-sm text-base-content/60">Ticket Category</p>
                                    <h4 className="text-lg font-bold capitalize">
                                        {selectedCategory.seat_class.replace('_', ' ')}
                                    </h4>
                                    <p className="text-xl font-black text-secondary">${selectedCategory.price}</p>
                                    <p className="text-sm text-base-content/70">
                                        {selectedCategory.available_count} seats remaining in this class
                                    </p>
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleBookSeat}
                                    disabled={bookingLoading}
                                >
                                    {bookingLoading ? "Processing..." : "Confirm Booking"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}