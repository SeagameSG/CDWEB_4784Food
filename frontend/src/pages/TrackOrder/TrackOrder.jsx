import React, { useContext, useEffect, useState, useRef } from 'react';
import './TrackOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TrackOrder = () => {
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const mapContainerRef = useRef(null);
  const mapLibraryLoaded = useRef(false);

  // Function to fetch orders
  const fetchOrders = async () => {
    try {
      const response = await axios.post(url + "/api/order/userorders", {}, { headers: { token } });
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  // Geocode address to coordinates using OpenStreetMap Nominatim
  const geocodeAddress = async (address) => {
    try {
      // Format the address for URL
      const formattedAddress = encodeURIComponent(address);
      const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${formattedAddress}&limit=1`);
      
      if (response.data && response.data.length > 0) {
        return {
          lat: parseFloat(response.data[0].lat),
          lng: parseFloat(response.data[0].lon)
        };
      } else {
        console.error("No coordinates found for address");
        // Default to a fallback location (center of Vietnam)
        return { lat: 16.0544, lng: 108.2022 };
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      // Default to a fallback location (center of Vietnam)
      return { lat: 16.0544, lng: 108.2022 };
    }
  };

  // Initialize MapLibre GL map
  const initializeMap = async (order) => {
    if (!order || !order.address || !mapLibraryLoaded.current) return;
    
    // Get address from order
    const address = `${order.address.street}, ${order.address.city}, ${order.address.state}, ${order.address.country}`;
    
    try {
      // Get coordinates from address
      const coordinates = await geocodeAddress(address);
      
      // Clear any existing map
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
      }
      
      // Create new MapLibre GL map
      const newMap = new window.maplibregl.Map({
        container: 'map-container',
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [coordinates.lng, coordinates.lat], // MapLibre uses [lng, lat] order
        zoom: 14,
        attributionControl: true
      });
      
      // Add navigation controls
      newMap.addControl(new window.maplibregl.NavigationControl());
      
      // Add marker when map loads
      newMap.on('load', () => {
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'maplibre-marker';
        
        // Create popup with order information
        const popup = new window.maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div class="map-popup">
              <h3>Địa chỉ giao hàng</h3>
              <p>${order.address.street}, ${order.address.city}</p>
              <p>${order.address.state}, ${order.address.country}</p>
              <p><strong>Trạng thái:</strong> ${order.status}</p>
            </div>
          `);
        
        // Add marker to map
        new window.maplibregl.Marker(markerEl)
          .setLngLat([coordinates.lng, coordinates.lat])
          .setPopup(popup)
          .addTo(newMap);
        
        // Open popup by default
        popup.addTo(newMap);
      });
      
      setMap(newMap);
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  // Load MapLibre GL JS scripts and styles
  const loadMapLibreScripts = () => {
    // Add MapLibre GL JS script
    const script = document.createElement('script');
    script.src = "https://unpkg.com/maplibre-gl/dist/maplibre-gl.js";
    script.async = true;
    document.head.appendChild(script);
    
    // Add MapLibre GL CSS
    const link = document.createElement('link');
    link.href = "https://unpkg.com/maplibre-gl/dist/maplibre-gl.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    
    // Set flag when script is loaded
    script.onload = () => {
      mapLibraryLoaded.current = true;
      
      // Initialize map with first order if available
      if (data.length > 0) {
        initializeMap(data[0]);
      }
    };
  };

  useEffect(() => {
    if (token) {
      fetchOrders();
    }

    // If we have a success parameter and it's true, show a success toast
    if (success === "true") {
      toast.success("Thanh toán đơn hàng thành công", {
        position: "top-center",
        autoClose: 5000,
      });
    }

    // Load MapLibre scripts
    loadMapLibreScripts();

    // Set up interval to refresh order status periodically
    const intervalId = setInterval(() => {
      if (token) {
        fetchOrders();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(intervalId); // Cleanup on unmount
      
      // Clean up map instance if it exists
      if (map) {
        map.remove();
      }
    };
  }, [token]);

  useEffect(() => {
    // When we get data, initialize the map with the first order
    if (data.length > 0 && mapLibraryLoaded.current) {
      initializeMap(data[0]);
    }
  }, [data, mapLibraryLoaded.current]);

  return (
    <div className="track-order">
      <ToastContainer />
      <h2>Theo Dõi Đơn Hàng</h2>
      
      {loading ? (
        <div className="loading-spinner">Đang tải...</div>
      ) : (
        <div className="track-order-container">
          {/* Map container */}
          <div id="map-container" ref={mapContainerRef} className="map-container"></div>

          {/* Orders list */}
          <div className="orders-list">
            {data.length > 0 ? (
              data.map((order, index) => (
                <div key={index} className='order-item'>
                  <img src={assets.parcel_icon} alt="" />
                  <div className="order-details">
                    <p className="order-items">
                      {order.items.map((item, index) => {
                        if (index === order.items.length - 1) {
                          return item.name + " X " + item.quantity;
                        } else {
                          return item.name + " X " + item.quantity + ", ";
                        }
                      })}
                    </p>
                    <p className="order-price">&#8377; {order.amount}.00</p>
                    <p className="order-count">Items: {order.items.length}</p>
                    <div className="order-status">
                      <span className="status-dot">&#x25cf; </span>
                      <b>{order.status}</b>
                    </div>
                    <div className="order-address">
                      <p><strong>Địa chỉ giao hàng:</strong></p>
                      <p>{order.address.street}, {order.address.city}</p>
                      <p>{order.address.state}, {order.address.country}, {order.address.zipcode}</p>
                    </div>
                  </div>
                  <button onClick={() => initializeMap(order)} className="view-on-map-btn">
                    Xem trên bản đồ
                  </button>
                </div>
              ))
            ) : (
              <p className="no-orders">Bạn chưa có đơn hàng nào</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
