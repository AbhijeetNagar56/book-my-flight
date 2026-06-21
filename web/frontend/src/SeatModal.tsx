import { useEffect, useState } from "react";
import api from "./Api";
import toast from "react-hot-toast";
import { X } from "lucide-react";

interface Seat {
    _id: string;
    seat_no: string;
    seat_class: 'economy' | 'premium_economy' | 'business' | 'first_class';
    price: number;
    is_booked: boolean;
}

interface SeatModalProps {
    flightId: string;
    onClose: () => void;
}

export default function SeatModal({ flightId, onClose }: SeatModalProps) {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Fetch embedded flight seats
    useEffect(() => {
        const fetchSeats = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/airport/flights/${flightId}/seats`);
                setSeats(res.data.seats);
            } catch (err: any) {
                toast.error(err.response?.data?.msg || "Could not load seats");
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchSeats();
    }, [flightId, onClose]);

    // Handle book event
    const handleBookSeat = async () => {
        if (!selectedSeat) return;
        
        try {
            setBookingLoading(true);
            const res = await api.post("/user/bookings", {
                flight_id: flightId,
                seat_no: selectedSeat.seat_no
            });

            if (res.data.success) {
                toast.success(`Seat ${selectedSeat.seat_no} confirmed!`);
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
                        <div className="bg-base-300 p-4 rounded-xl max-h-96 overflow-y-auto">
                            <div className="space-y-3">
                                {seats.map((seat) => (
                                    <div
                                        key={seat._id}
                                        className="flex flex-col gap-2 p-3 rounded-xl border border-base-300 bg-base-100"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold">Seat {seat.seat_no}</p>
                                                <p className="text-xs text-base-content/70 capitalize">{seat.seat_class.replace('_', ' ')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-semibold ${seat.is_booked ? 'text-error' : 'text-success'}`}>
                                                    {seat.is_booked ? 'Booked' : 'Available'}
                                                </p>
                                                {!seat.is_booked && (
                                                    <p className="text-sm font-black text-secondary">${seat.price}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={seat.is_booked}
                                            onClick={() => setSelectedSeat(seat)}
                                            className={`btn btn-sm ${seat.is_booked ? 'btn-disabled' : 'btn-primary'}`}
                                        >
                                            {seat.is_booked ? 'Unavailable' : 'Select Seat'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedSeat && (
                            <div className="bg-base-100 p-4 rounded-xl flex flex-col gap-4 border border-base-300">
                                <div>
                                    <p className="text-sm text-base-content/60">Selected Seat</p>
                                    <h4 className="text-lg font-bold">
                                        {selectedSeat.seat_no} <span className="text-sm font-normal capitalize text-primary">({selectedSeat.seat_class.replace('_', ' ')})</span>
                                    </h4>
                                    <p className="text-xl font-black text-secondary">${selectedSeat.price}</p>
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