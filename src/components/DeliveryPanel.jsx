import React, { useState } from 'react';
import { Truck, Navigation, PackageCheck, CheckCircle2, Clock, MapPin, Send, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function DeliveryPanel({ villager, inventory = [] }) {
  const [recipientName, setRecipientName] = useState(villager?.name || 'Rahul Barad');
  const [phone, setPhone] = useState(villager?.phone || '9876543210');
  const [location, setLocation] = useState(villager?.village || 'Rampur Gram Panchayat, Sector 4');
  const [selectedMed, setSelectedMed] = useState(inventory[0]?.name || 'Paracetamol 500mg');
  const [quantity, setQuantity] = useState(1);
  const [deliveryMode, setDeliveryMode] = useState('DRONE'); // 'DRONE' | 'AMBULANCE' | 'EXPRESS'
  
  const [activeOrders, setActiveOrders] = useState([]);

  const handleDispatchOrder = (e) => {
    e.preventDefault();
    if (!recipientName.trim() || !location.trim()) return alert('Please enter recipient name and location');

    const newOrder = {
      orderId: `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      location: location.trim(),
      medicine: selectedMed,
      quantity,
      deliveryMode,
      status: 'DISPATCHED VIA DRONE',
      progress: 50,
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setActiveOrders((prev) => [newOrder, ...prev]);

    // Simulate Live Tracking Progress
    setTimeout(() => {
      setActiveOrders((prev) =>
        prev.map(o => o.orderId === newOrder.orderId ? { ...o, status: 'IN TRANSIT TO VILLAGE', progress: 80 } : o)
      );
    }, 3000);

    setTimeout(() => {
      setActiveOrders((prev) =>
        prev.map(o => o.orderId === newOrder.orderId ? { ...o, status: 'DELIVERED TO LOCATION', progress: 100 } : o)
      );
    }, 6000);
  };

  return (
    <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6 max-w-4xl mx-auto w-full">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-cyan-500 to-teal-500 rounded-2xl text-slate-950 shadow-lg shadow-cyan-500/30 font-black">
            <Truck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-base sm:text-lg flex items-center gap-2">
              Emergency Rural Medicine & Drone Delivery Dispatch
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full font-mono border border-cyan-800 uppercase">
                GPS Live Tracking
              </span>
            </h3>
            <p className="text-xs text-slate-400">Autonomous Drone & Emergency Express Delivery to any Village Location</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Dispatch Form */}
        <form onSubmit={handleDispatchOrder} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest block">
            📍 Dispatch Medicine Order to Location:
          </span>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Recipient Name</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Rahul Barad"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-500 font-bold"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1">Mobile Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-bold mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" /> GPS / Village Delivery Address
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Rampur Gram Panchayat, House #42"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 outline-none focus:border-cyan-500 font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 font-bold mb-1">Select Medicine</label>
              <select
                value={selectedMed}
                onChange={(e) => setSelectedMed(e.target.value)}
                className="w-full bg-slate-900 text-teal-300 font-bold border border-slate-800 rounded-xl px-2.5 py-2.5 outline-none"
              >
                {inventory.map(m => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1">Dispatch Mode</label>
              <select
                value={deliveryMode}
                onChange={(e) => setDeliveryMode(e.target.value)}
                className="w-full bg-slate-900 text-cyan-300 font-bold border border-slate-800 rounded-xl px-2.5 py-2.5 outline-none"
              >
                <option value="DRONE">🛸 Autonomous Drone</option>
                <option value="AMBULANCE">🚑 Emergency Ambulance</option>
                <option value="EXPRESS">🚚 Express Courier</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transform hover:scale-[1.02]"
          >
            <Send className="w-4 h-4 fill-current" /> Dispatch Emergency Delivery Now
          </button>
        </form>

        {/* Right Active Dispatch Live Tracker */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest block">
            🛸 Live Autonomous Dispatch Tracking ({activeOrders.length}):
          </span>

          {activeOrders.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activeOrders.map((order) => (
                <div key={order.orderId} className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-300">{order.orderId}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      order.progress === 100 ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-cyan-950 text-cyan-300 border-cyan-800 animate-pulse'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <p className="font-extrabold text-slate-200">{order.medicine} x {order.quantity}</p>
                  <p className="text-[11px] text-slate-400">Recipient: {order.recipientName} • {order.location}</p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-teal-400 h-full transition-all duration-500"
                      style={{ width: `${order.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-500 space-y-2">
              <Navigation className="w-8 h-8 mx-auto stroke-1" />
              <p>No active delivery dispatches. Fill the form to dispatch emergency drone delivery to any village GPS location.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
