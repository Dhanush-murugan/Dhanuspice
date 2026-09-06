"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiHome,
  FiBriefcase,
  FiArrowLeft,
} from "react-icons/fi";
import { useStore } from "@/store/useStore";
import { Address } from "@/types";
import toast from "react-hot-toast";

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    label: "Home",
    fullAddress: "123 Spice Garden, MG Road, Bangalore",
    landmark: "Opposite Metro Station",
    pincode: "560001",
    coordinates: { lat: 12.9716, lng: 77.5946 },
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Work",
    fullAddress: "Tech Park Phase 2, IT Corridor, Bangalore",
    landmark: "Tower B, 4th Floor",
    pincode: "560100",
    coordinates: { lat: 12.8399, lng: 77.677 },
    isDefault: false,
  },
];

export default function AddressesPage() {
  const { user, setUser } = useStore();
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [label, setLabel] = useState("Home");
  const [fullAddress, setFullAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("dhanuspice_saved_addresses");
        if (saved) {
          setAddresses(JSON.parse(saved));
        } else if (user?.addresses && user.addresses.length > 0) {
          setAddresses(user.addresses);
        }
      } catch {
        // ignore
      }
    }
  }, [user]);

  const saveAddresses = (newAddrs: Address[]) => {
    setAddresses(newAddrs);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("dhanuspice_saved_addresses", JSON.stringify(newAddrs));
      } catch {
        // ignore
      }
    }
    if (user) {
      setUser({ ...user, addresses: newAddrs });
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullAddress || !pincode) {
      toast.error("Please fill required address fields");
      return;
    }

    const newAddr: Address = {
      id: `addr-${Date.now()}`,
      label,
      fullAddress,
      landmark,
      pincode,
      coordinates: { lat: 12.9716, lng: 77.5946 },
      isDefault: addresses.length === 0,
    };

    const updated = [newAddr, ...addresses];
    saveAddresses(updated);
    setShowAddForm(false);
    setFullAddress("");
    setLandmark("");
    setPincode("");
    toast.success("New address added successfully!");
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddresses(updated);
    toast.success("Default address updated!");
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    saveAddresses(updated);
    toast.success("Address removed");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-500 mb-2 transition"
            >
              <FiArrowLeft />
              Back to Profile
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <FiMapPin className="text-primary-500" />
              Saved Delivery Addresses
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Select or manage addresses for quick 1-click checkout.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            <FiPlus className="w-4 h-4" />
            Add New Address
          </button>
        </div>

        {/* Add Address Form */}
        {showAddForm && (
          <form
            onSubmit={handleAdd}
            className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-primary-300 dark:border-primary-700 shadow-md mb-8 animate-fadeIn"
          >
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
              Add New Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Label
                </label>
                <select
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Complete Street Address
                </label>
                <input
                  type="text"
                  placeholder="House/Flat number, Building name, Street"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Near Park, Behind Mall"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="e.g. 560001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-gray-50 dark:bg-gray-700/50"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold hover:bg-primary-600"
              >
                Save Address
              </button>
            </div>
          </form>
        )}

        {/* Addresses list */}
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white dark:bg-gray-800 p-6 rounded-2xl border transition shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                addr.isDefault
                  ? "border-primary-500 ring-1 ring-primary-500/20"
                  : "border-gray-100 dark:border-gray-700"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                    addr.label === "Home"
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/40"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/40"
                  }`}
                >
                  {addr.label === "Home" ? <FiHome /> : <FiBriefcase />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base">
                      {addr.label}
                    </h3>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-300 text-[10px] font-bold rounded-md uppercase">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 max-w-lg">
                    {addr.fullAddress}
                  </p>
                  {addr.landmark && (
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Landmark: {addr.landmark}
                    </p>
                  )}
                  <p className="text-[11px] text-gray-400">Pincode: {addr.pincode}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:text-primary-500 border border-gray-200 dark:border-gray-700 rounded-lg transition"
                  >
                    <FiCheck className="w-3 h-3" />
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition"
                  title="Delete"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
