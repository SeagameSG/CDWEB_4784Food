import React, { useState, useEffect, useContext, useRef } from 'react';
import './MyAddress.css';
import { StoreContext } from '../../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
  
  // Map related refs and state
  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
  const mapContainer = useRef(null);
  const map = useRef(null);
  const mapLoaded = useRef(false);
  const crosshair = useRef(null);

  // Fetch all addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`${url}/api/address/list`, {}, { headers: { token } });
      if (response.data.success) {
        setAddresses(response.data.data);
      } else {
        toast.error(t('addresses.fetchError'));
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error(t('addresses.fetchError'));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token]);

  // Initialize map when form is shown
  useEffect(() => {
    if (showForm && mapContainer.current && !map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
        center: [newAddress.coordinates.lng, newAddress.coordinates.lat],
        zoom: 14
      });

      map.current.on('load', () => {
        mapLoaded.current = true;
        
        // Add crosshair to center of map
        const el = document.createElement('div');
        el.className = 'map-crosshair';
        el.innerHTML = '+'
        crosshair.current = el;
        
        const crosshairContainer = document.createElement('div');
        crosshairContainer.className = 'crosshair-container';
        crosshairContainer.appendChild(el);
        map.current.getContainer().appendChild(crosshairContainer);
        
        // Update coordinates on map move
        map.current.on('moveend', () => {
          const center = map.current.getCenter();
          setNewAddress(prev => ({
            ...prev,
            coordinates: {
              lat: center.lat,
              lng: center.lng
            }
          }));
        });
      });

      // Clean up map on unmount
      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
          mapLoaded.current = false;
        }
      };
    }
  }, [showForm]);

  // Update map center when coordinates change directly from inputs
  useEffect(() => {
    if (map.current && mapLoaded.current) {
      map.current.setCenter([newAddress.coordinates.lng, newAddress.coordinates.lat]);
    }
  }, [newAddress.coordinates.lat, newAddress.coordinates.lng]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      // Handle coordinate input changes
      const numValue = parseFloat(value);
      
      if (!isNaN(numValue)) {
        setNewAddress(prev => ({
          ...prev,
          coordinates: {
            ...prev.coordinates,
            [name]: numValue
          }
        }));
      }
    } else {
      setNewAddress({ ...newAddress, [name]: value });
    }
  };

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setNewAddress(prev => ({
            ...prev,
            coordinates
          }));
          
          if (map.current) {
            map.current.setCenter([coordinates.lng, coordinates.lat]);
          }
          
          setGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGettingLocation(false);
          toast.error(t('addresses.locationError'));
        }
      );
    } else {
      toast.error(t('addresses.browserNotSupported'));
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
          toast.success(t('addresses.updateSuccess'));
          fetchAddresses();
          resetForm();
        } else {
          toast.error(response.data.message || t('addresses.updateError'));
        }
      } else {
        // Add new address
        const response = await axios.post(
          `${url}/api/address/add`, 
          newAddress, 
          { headers: { token } }
        );
        
        if (response.data.success) {
          toast.success(t('addresses.addSuccess'));
          fetchAddresses();
          resetForm();
        } else {
          toast.error(response.data.message || t('addresses.addError'));
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error(t('addresses.saveError'));
    }
  };

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

  const deleteAddress = async (addressId) => {
    if (window.confirm(t('addresses.confirmDelete'))) {
      try {
        const response = await axios.post(
          `${url}/api/address/delete`,
          { addressId },
          { headers: { token } }
        );
        
        if (response.data.success) {
          toast.success(t('addresses.deleteSuccess'));
          fetchAddresses();
        } else {
          toast.error(response.data.message || t('addresses.deleteError'));
        }
      } catch (error) {
        console.error("Error deleting address:", error);
        toast.error(t('addresses.deleteError'));
      }
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const response = await axios.post(
        `${url}/api/address/set-default`,
        { addressId },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success(t('addresses.defaultSuccess'));
        fetchAddresses();
      } else {
        toast.error(response.data.message || t('addresses.defaultError'));
      }
    } catch (error) {
      console.error("Error setting default address:", error);
      toast.error(t('addresses.defaultError'));
    }
  };

  const resetForm = () => {
    setNewAddress({
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
    setEditMode(false);
    setCurrentAddressId(null);
    setShowForm(false);
  };

  return (
    <div className="my-address">
      <div className="address-header">
        <h2>{t('addresses.title')}</h2>
        <button className="add-address-btn" onClick={() => setShowForm(true)}>
          {t('addresses.addNew')}
        </button>
      </div>
      
      {loading ? (
        <p>{t('common.loading')}</p>
      ) : addresses.length === 0 ? (
        <p className="no-addresses">{t('addresses.noAddresses')}</p>
      ) : (
        <div className="address-list">
          {addresses.map((address) => (
            <div key={address._id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              <div className="address-details">
                <div className="address-header-row">
                  <h3 className="address-name">{address.name}</h3>
                  {address.isDefault && <span className="default-badge">{t('addresses.default')}</span>}
                </div>
                <p className="address-text">{address.street}, {address.city}, {address.state}, {address.zipcode}</p>
                <p className="address-text">{address.phone}</p>
                <p className="address-coords">
                  {t('addresses.coordinates')}: {address.coordinates.lat.toFixed(5)}, {address.coordinates.lng.toFixed(5)}
                </p>
              </div>
              <div className="address-actions">
                <button className="edit-btn" onClick={() => editAddress(address)}>
                  {t('addresses.edit')}
                </button>
                <button className="remove-btn" onClick={() => deleteAddress(address._id)}>
                  {t('addresses.remove')}
                </button>
                {!address.isDefault && (
                  <button className="default-btn" onClick={() => setDefaultAddress(address._id)}>
                    {t('addresses.setDefault')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Address Form Modal */}
      {showForm && (
        <div className="address-modal">
          <div className="address-modal-content">
            <div className="modal-header">
              <h3>{editMode ? t('addresses.editAddress') : t('addresses.addAddress')}</h3>
              <button className="close-btn" onClick={resetForm}>&times;</button>
            </div>
            
            <div className="address-form">
              <div className="form-group">
                <label>{t('addresses.name')}</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newAddress.name} 
                  onChange={handleChange} 
                  placeholder={t('addresses.namePlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label>{t('addresses.phone')}</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={newAddress.phone} 
                  onChange={handleChange} 
                  placeholder={t('addresses.phonePlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label>{t('addresses.street')}</label>
                <input 
                  type="text" 
                  name="street" 
                  value={newAddress.street} 
                  onChange={handleChange} 
                  placeholder={t('addresses.streetPlaceholder')}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t('addresses.city')}</label>
                  <input 
                    type="text" 
                    name="city" 
                    value={newAddress.city} 
                    onChange={handleChange} 
                    placeholder={t('addresses.cityPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('addresses.state')}</label>
                  <input 
                    type="text" 
                    name="state" 
                    value={newAddress.state} 
                    onChange={handleChange} 
                    placeholder={t('addresses.statePlaceholder')}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t('addresses.zipcode')}</label>
                  <input 
                    type="text" 
                    name="zipcode" 
                    value={newAddress.zipcode} 
                    onChange={handleChange} 
                    placeholder={t('addresses.zipcodePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('addresses.country')}</label>
                  <input 
                    type="text" 
                    name="country" 
                    value={newAddress.country} 
                    onChange={handleChange} 
                    placeholder={t('addresses.countryPlaceholder')}
                  />
                </div>
              </div>
              
              {/* Map Container */}
              <div className="map-section">
                <label>{t('addresses.selectLocation')}</label>
                <div className="map-container" ref={mapContainer}></div>
                
                <div className="map-instructions">
                  <p>{t('addresses.mapInstructions')}</p>
                  <button 
                    type="button" 
                    className="location-btn" 
                    onClick={getUserLocation}
                    disabled={gettingLocation}
                  >
                    {gettingLocation ? t('addresses.locating') : t('addresses.useMyLocation')}
                  </button>
                </div>
                
                <div className="form-row coordinates-inputs">
                  <div className="form-group">
                    <label>{t('addresses.latitude')}</label>
                    <input 
                      type="text" 
                      name="lat" 
                      value={newAddress.coordinates.lat} 
                      onChange={handleChange} 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{t('addresses.longitude')}</label>
                    <input 
                      type="text" 
                      name="lng" 
                      value={newAddress.coordinates.lng} 
                      onChange={handleChange} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-group checkbox">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  name="isDefault" 
                  checked={newAddress.isDefault} 
                  onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})} 
                />
                <label htmlFor="isDefault">{t('addresses.makeDefault')}</label>
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={resetForm}>
                  {t('common.cancel')}
                </button>
                <button type="button" className="save-btn" onClick={addAddress}>
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAddress;