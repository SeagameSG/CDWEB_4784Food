import React, { useState, useEffect, useContext } from 'react';
import './MyAddress.css';
import { StoreContext } from '../../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

const MyAddress = () => {
  const { t } = useTranslation();
  const { url, token } = useContext(StoreContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "VietNam",
    coordinates: {lat: 10.8685, lng: 106.7800},
    isDefault: false
  });

  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Fetch all addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${url}/api/address/list`, {}, { headers: { token } });
      if (response.data.success) {
        setAddresses(response.data.data);
      } else {
        toast.error("Failed to fetch addresses");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Error fetching addresses");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({ ...newAddress, [name]: value });
  };

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setNewAddress(prev => ({
            ...prev,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGettingLocation(false);
          toast.error("Could not get your location. Using default location.");
        }
      );
    } else {
      toast.error("Your browser doesn't support geolocation");
    }
  };

  // Add new address
  const addAddress = async () => {
    try {
      if (editMode) {
        // Update existing address
        const response = await axios.post(
          `${url}/api/address/update`, 
          { ...newAddress, addressId: currentAddressId }, 
          { headers: { token } }
        );
        
        if (response.data.success) {
          toast.success("Address updated successfully");
          fetchAddresses();
          resetForm();
        } else {
          toast.error(response.data.message);
        }
      } else {
        // Add new address
        const response = await axios.post(
          `${url}/api/address/add`, 
          newAddress, 
          { headers: { token } }
        );
        
        if (response.data.success) {
          toast.success("Address added successfully");
          fetchAddresses();
          resetForm();
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Error saving address");
    }
  };

  // Edit address
  const editAddress = (address) => {
    setNewAddress({
      name: address.name,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      zipcode: address.zipcode,
      country: address.country,
      coordinates: address.coordinates,
      isDefault: address.isDefault
    });
    setCurrentAddressId(address._id);
    setEditMode(true);
    setShowForm(true);
  };

  // Delete address
  const removeAddress = async (id) => {
    try {
      const response = await axios.post(
        `${url}/api/address/delete`, 
        { addressId: id }, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Address removed successfully");
        fetchAddresses();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Error deleting address");
    }
  };

  // Set as default address
  const setAsDefault = async (id) => {
    try {
      const response = await axios.post(
        `${url}/api/address/set-default`, 
        { addressId: id }, 
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Default address updated");
        fetchAddresses();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error("Error setting default address");
    }
  };

  // Reset form
  const resetForm = () => {
    setNewAddress({
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      zipcode: "",
      country: "VietNam",
      coordinates: { lat: 16.0544, lng: 108.2022 },
      isDefault: false
    });
    setEditMode(false);
    setCurrentAddressId(null);
    setShowForm(false);
  };

  return (
    <div className="my-address">
      {/* Title & Add Address Button at the Top */}
      <div className="address-header">
        <h2>{t('myAddress.title')}</h2>
        <button className="add-address-btn" onClick={() => setShowForm(true)}>
          + {t('myAddress.addNewAddress')}
        </button>
      </div>

      {/* Address List */}
      <div className="address-list">
        {loading ? (
          <p className="loading-text">{t('myAddress.loading')}</p>
        ) : addresses.length === 0 ? (
          <p className="no-address">{t('myAddress.noAddress')}</p>
        ) : (
          addresses.map((address) => (
            <div key={address._id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              <div className="address-details">
                <div className="address-header-row">
                  <p className="address-name">{address.name}</p>
                  {address.isDefault && <span className="default-badge">{t('myAddress.default')}</span>}
                </div>
                <p className="address-text">{address.phone}</p>
                <p className="address-text">{address.street}</p>
                <p className="address-text">{address.city}, {address.state}</p>
                <p className="address-text">{address.country}, {address.zipcode}</p>
                <p className="address-coords">
                  {t('myAddress.coordinates')} {address.coordinates.lat.toFixed(4)}, {address.coordinates.lng.toFixed(4)}
                </p>
              </div>
              <div className="address-actions">
                {!address.isDefault && (
                  <button className="default-btn" onClick={() => setAsDefault(address._id)}>
                    {t('myAddress.makeDefault')}
                  </button>
                )}
                <button className="edit-btn" onClick={() => editAddress(address)}>{t('myAddress.edit')}</button>
                <button className="remove-btn" onClick={() => removeAddress(address._id)}>{t('myAddress.delete')}</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div className="address-modal">
          <div className="address-form">
            <h3>{editMode ? t('myAddress.editAddress') : t('myAddress.addAddress')}</h3>
            <input 
              type="text" 
              name="name" 
              placeholder={t('myAddress.fullName')}
              value={newAddress.name} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="phone" 
              placeholder={t('myAddress.phone')}
              value={newAddress.phone} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="text" 
              name="street" 
              placeholder={t('myAddress.street')}
              value={newAddress.street} 
              onChange={handleChange} 
              required 
            />
            <div className="form-row">
              <input 
                type="text" 
                name="city" 
                placeholder={t('myAddress.city')}
                value={newAddress.city} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="text" 
                name="state" 
                placeholder={t('myAddress.state')}
                value={newAddress.state} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-row">
              <input 
                type="text" 
                name="zipcode" 
                placeholder={t('myAddress.zipCode')}
                value={newAddress.zipcode} 
                onChange={handleChange} 
                required 
              />
              <input 
                type="text" 
                name="country" 
                placeholder={t('myAddress.country')}
                value={newAddress.country} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <div className="location-section">
              <div className="coordinates-display">
                <p>{t('myAddress.coordinates')} {newAddress.coordinates.lat.toFixed(4)}, {newAddress.coordinates.lng.toFixed(4)}</p>
              </div>
              <button 
                type="button" 
                className="get-location-btn" 
                onClick={getUserLocation}
                disabled={gettingLocation}
              >
                {gettingLocation ? t('myAddress.gettingLocation') : t('myAddress.getCurrentLocation')}
              </button>
            </div>
            
            <div className="form-actions">
              <button type="button" className="save-btn" onClick={addAddress}>
                {t('myAddress.save')}
              </button>
              <button type="button" className="cancel-btn" onClick={resetForm}>
                {t('myAddress.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAddress;