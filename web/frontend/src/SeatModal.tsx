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
                const res = await api.get(`/flights/${flightId}/seats`);
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
            const res = await api.post("/bookings", {
                flight_id: flightId,
                seat_no: selectedSeat.seat_no // Backend matches via seat_no string literal
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
                    <h3 className="font-bold text-xl">Select Your Seat</h3>
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
                        {/* Interactive Seat Map Matrix Layout wrapper */}
                        <div className="bg-base-300 p-4 rounded-xl max-h-64 overflow-y-auto">
                            <p className="text-xs text-center uppercase tracking-widest text-base-content/40 mb-4">Front of Aircraft</p>
                            <div className="grid grid-cols-4 gap-3 justify-items-center">
                                {seats.map((seat) => (
                                    <button
                                        key={seat._id}
                                        disabled={seat.is_booked}
                                        onClick={() => setSelectedSeat(seat)}
                                        className={`btn btn-md w-14 h-12 flex flex-col p-1 text-xs ${
                                            seat.is_booked 
                                                ? "btn-disabled bg-base-100" 
                                                : selectedSeat?.seat_no === seat.seat_no 
                                                    ? "btn-primary" 
                                                    : "btn-outline"
                                        }`}
                                    >
                                        <span className="font-bold">{seat.seat_no}</span>
                                        <span className="text-[9px] opacity-70">${seat.price}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Booking Details Window Footer */}
                        {selectedSeat && (
                            <div className="bg-base-100 p-4 rounded-xl flex items-center justify-between border border-base-300">
                                <div>
                                    <p className="text-sm text-base-content/60">Selected Unit Details</p>
                                    <h4 className="text-lg font-bold">
                                        Seat {selectedSeat.seat_no} <span className="text-sm font-normal capitalize text-primary">({selectedSeat.seat_class.replace('_', ' ')})</span>
                                    </h4>
                                    <p className="text-xl font-black text-secondary">${selectedSeat.price}</p>
                                </div>
                                <button 
                                    className="btn btn-secondary" 
                                    onClick={handleBookSeat}
                                    disabled={bookingLoading}
                                >
                                    {bookingLoading ? "Processing..." : "Confirm Flight Booking"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}