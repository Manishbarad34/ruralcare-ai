import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Pill, ShieldCheck, CheckCircle2, ArrowRight, Truck, Package, ShoppingCart, X } from 'lucide-react';

export default function MedicineMarketplace({ token, user }) {
  const [medicines, setMedicines] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Shopping Cart State
  const [cart, setCart] = useState([]); // [{ medicineId, name, price, quantity, slot }]
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Address, 3: Delivery Method, 4: Confirmed

  // Delivery Address State
  const [fullName, setFullName] = useState(user?.patientProfile?.fullName || '');
  const [phone, setPhone] = useState('9876543210');
  const [addressLine, setAddressLine] = useState('House #12, Gram Panchayat Road');
  const [village, setVillage] = useState(user?.patientProfile?.village || 'Rampur');
  const [district, setDistrict] = useState('Rajkot');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('360001');

  const [deliveryMethod, setDeliveryMethod] = useState('DRONE');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const categories = ['ALL', 'Fever / Cold / Flu', 'Bacterial Infection', 'Allergy / Cough / Cold', 'Dehydration / Diarrhea', 'Diabetes / High Blood Sugar'];

  const fetchMedicines = async () => {
    try {
      const url = `/api/medicines?category=${selectedCategory}&query=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMedicines(data.medicines || []);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchMedicines();
  }, [selectedCategory, searchQuery]);

  const addToCart = (med) => {
    setCart((prev) => {
      const exists = prev.find(item => item.medicineId === med.id);
      if (exists) {
        return prev.map(item => item.medicineId === med.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { medicineId: med.id, name: med.name, price: med.price, quantity: 1, slot: med.slot, unit: med.unit }];
    });
  };

  const updateCartQuantity = (medId, delta) => {
    setCart((prev) =>
      prev
        .map(item => item.medicineId === medId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
        .filter(item => item.quantity > 0)
    );
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch('/api/medicines/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          deliveryAddress: {
            fullName,
            phone,
            addressLine,
            village,
            district,
            state,
            pincode
          },
          deliveryMethod
        })
      });

      const data = await res.json();
      if (res.ok) {
        setPlacedOrder(data.order);
        setCheckoutStep(4);
        setCart([]);
        fetchMedicines(); // Refresh stock inventory from DB
      } else {
        setErrorMsg(data.error || 'Failed to place order.');
      }
    } catch (err) {
      setErrorMsg('Network error placing order.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 w-full">
      
      {/* Header & Cart Badge Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-teal-400" />
            RuralCare Kiosk Medicine Marketplace
          </h2>
          <p className="text-xs text-slate-400">Database-Backed Stock Inventory & Drone Delivery Checkout</p>
        </div>

        <button
          onClick={() => { setIsCheckoutOpen(true); setCheckoutStep(1); }}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transform hover:scale-105"
        >
          <ShoppingCart className="w-4 h-4 fill-current" />
          <span>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          <span className="bg-slate-950 text-teal-300 px-2 py-0.5 rounded-lg border border-teal-800 font-mono">
            ₹{calculateTotal().toFixed(2)}
          </span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search medicine catalog by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 pl-10 text-xs text-slate-100 outline-none focus:border-teal-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-slate-950 border-teal-400 font-black'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Medicine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {medicines.map((med) => (
          <div key={med.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3 hover:border-teal-500/50 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-400 text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {med.slot}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${med.currentStock > 0 ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-rose-950 text-rose-300 border-rose-800'}`}>
                  Stock: {med.currentStock} {med.unit}
                </span>
              </div>

              <h3 className="font-black text-sm text-slate-100 mt-2">{med.name}</h3>
              <p className="text-xs text-teal-300 font-semibold">{med.category}</p>
              <p className="text-[10px] text-slate-400 italic mt-1 font-mono">{med.recommendedDosage}</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-900">
              <span className="text-sm font-black text-slate-100 font-mono">₹{med.price.toFixed(2)}</span>
              <button
                onClick={() => addToCart(med)}
                disabled={med.currentStock <= 0}
                className="px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-teal-500/20 disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Multi-Step Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-slate-100 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-teal-400" />
                Medicine Checkout (Step {checkoutStep} of 4)
              </h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-1 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950 text-rose-300 border border-rose-800 rounded-xl text-xs font-bold">
                {errorMsg}
              </div>
            )}

            {/* STEP 1: Cart Items */}
            {checkoutStep === 1 && (
              <div className="space-y-3">
                <div className="max-h-48 overflow-y-auto space-y-2 text-xs">
                  {cart.length > 0 ? (
                    cart.map(item => (
                      <div key={item.medicineId} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-100 block">{item.name}</span>
                          <span className="text-[10px] text-slate-400">₹{item.price} x {item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateCartQuantity(item.medicineId, -1)} className="px-2 py-1 bg-slate-900 rounded font-bold">-</button>
                          <span className="font-bold text-teal-300">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.medicineId, 1)} className="px-2 py-1 bg-slate-900 rounded font-bold">+</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-4">Your cart is empty.</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-black">
                  <span>Total Amount:</span>
                  <span className="text-teal-300 font-mono text-sm">₹{calculateTotal().toFixed(2)}</span>
                </div>

                <button
                  onClick={() => setCheckoutStep(2)}
                  disabled={cart.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs shadow-lg disabled:opacity-50"
                >
                  Proceed to Delivery Address <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            )}

            {/* STEP 2: Delivery Address Form */}
            {checkoutStep === 2 && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Recipient Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Mobile Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100" />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Village & House Address</label>
                  <input type="text" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100" />
                </div>

                <button
                  onClick={() => setCheckoutStep(3)}
                  className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs shadow-lg"
                >
                  Select Delivery Mode <ArrowRight className="w-4 h-4 inline ml-1" />
                </button>
              </div>
            )}

            {/* STEP 3: Delivery Method & Place Order */}
            {checkoutStep === 3 && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-slate-300 block">Choose Delivery Dispatch Option:</span>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setDeliveryMethod('DRONE')}
                    className={`p-3 rounded-xl border text-left font-bold ${deliveryMethod === 'DRONE' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                  >
                    🛸 Autonomous Drone
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('EXPRESS')}
                    className={`p-3 rounded-xl border text-left font-bold ${deliveryMethod === 'EXPRESS' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-400'}`}
                  >
                    🚚 Kiosk Express Courier
                  </button>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-black rounded-xl text-xs shadow-lg"
                >
                  Confirm & Place Order (₹{calculateTotal().toFixed(2)})
                </button>
              </div>
            )}

            {/* STEP 4: Order Confirmed Receipt */}
            {checkoutStep === 4 && placedOrder && (
              <div className="text-center space-y-4 py-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="font-black text-slate-100 text-lg">Order Confirmed!</h4>
                <p className="text-xs text-slate-400">Order ID: <span className="font-mono text-teal-300 font-bold">{placedOrder.id}</span></p>
                <p className="text-xs text-slate-300">Status: <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">{placedOrder.status}</span></p>

                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="w-full py-2.5 bg-slate-800 text-teal-300 font-bold rounded-xl text-xs border border-slate-700"
                >
                  Close Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
