import React, { useEffect, useState, useRef } from 'react';
import './TrackOrder.css';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'react-router-dom';

const TrackOrder = ({ url }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || null);
  const mapInstanceRef = useRef(null);
  
  const [deliveryTimes, setDeliveryTimes] = useState({});

  // Default coordinates 4784Food
  const STORE_COORDINATES = { lat: 10.8499, lng: 106.8118 };
  
  const DEFAULT_COORDINATES = { lat: 10.8231, lng: 106.6297 };

  // Haversine
  const calculateDistance = (coords1, coords2) => {
    const R = 6371;
    const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
    const dLon = (coords2.lng - coords1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(coords1.lat * Math.PI / 180) * Math.cos(coords2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const calculateDeliveryTime = (orderCoordinates) => {
    if (!validateCoordinates(orderCoordinates)) {
      return {
        minutes: 45,
        formatted: 'About 45 minutes'
      };
    }

    const distance = calculateDistance(STORE_COORDINATES, orderCoordinates);

    const travelTime = distance / 0.5;
    const totalMinutes = Math.ceil(20 + travelTime);

    let formattedTime;
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (minutes > 0) {
        formattedTime = `About ${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else {
        formattedTime = `About ${hours} hour${hours > 1 ? 's' : ''}`;
      }
    } else {
      formattedTime = `About ${totalMinutes} minutes`;
    }

    return { minutes: totalMinutes, formatted: formattedTime };
  };

  const validateCoordinates = (coords) => {
    if (!coords) return false;
    if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return false;
    if (isNaN(coords.lat) || isNaN(coords.lng)) return false;
    if (coords.lat < -90 || coords.lat > 90) return false;
    if (coords.lng < -180 || coords.lng > 180) return false;
    return true;
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) {
        const ordersData = response.data.data;
        setData(ordersData);

        const times = {};
        ordersData.forEach(order => {
          times[order._id] = calculateDeliveryTime(order.coordinates);
        });
        setDeliveryTimes(times);

        if (orderId) {
          setSelectedOrderId(orderId);
        } 
        else if (!selectedOrderId && ordersData.length > 0) {
          setSelectedOrderId(ordersData[0]._id);
        }

        setLoading(false);
      } else {
        toast.error("Failed to fetch orders");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(`Error fetching orders: ${error.message}`);
      setLoading(false);
    }
  };

  // Initialize Leaflet map
  const initializeMap = (order) => {
    if (!order || !window.L) return;

    setSelectedOrderId(order._id);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    let coordinates = DEFAULT_COORDINATES;
    if (validateCoordinates(order.coordinates)) {
      coordinates = order.coordinates;
    } else {
      console.warn("Invalid coordinates in order, using default coordinates");
    }

    try {
      const bounds = [
        [STORE_COORDINATES.lat, STORE_COORDINATES.lng],
        [coordinates.lat, coordinates.lng]
      ];

      const map = window.L.map('map-container', {
        center: [
          (STORE_COORDINATES.lat + coordinates.lat) / 2,
          (STORE_COORDINATES.lng + coordinates.lng) / 2
        ],
        zoom: 12
      });

      map.fitBounds(bounds, { padding: [50, 50] });

      mapInstanceRef.current = map;

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      try {
        window.L.maplibreGL({
          style: 'https://tiles.openfreemap.org/styles/liberty',
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);
      } catch (mapLibreError) {
        console.warn("Error loading MapLibre GL layer:", mapLibreError);
      }

      const storeIcon = window.L.divIcon({
        html: `<div class="store-marker"><i class="fas fa-store"></i></div>`,
        className: 'store-icon',
        iconSize: [30, 30]
      });

      window.L.marker([STORE_COORDINATES.lat, STORE_COORDINATES.lng], {
        icon: storeIcon
      })
        .addTo(map)
        .bindPopup(`
          <div class="map-popup store-popup">
            <h3>4784Food Store</h3>
            <p>Main restaurant location</p>
          </div>
        `);

      const deliveryIcon = window.L.divIcon({
        html: `<div class="delivery-marker"><i class="fas fa-map-marker"></i></div>`,
        className: 'delivery-icon',
        iconSize: [30, 30]
      });

      window.L.marker([coordinates.lat, coordinates.lng], {
        icon: deliveryIcon
      })
        .addTo(map)
        .bindPopup(`
          <div class="map-popup">
            <h3>Delivery Address</h3>
            <p>${order.address.street || ''}, ${order.address.city || ''}</p>
            <p>${order.address.state || ''}, ${order.address.country || ''}</p>
            <p><strong>Status:</strong> ${order.status || 'Processing'}</p>
            <p><strong>Estimated Delivery Time:</strong> ${deliveryTimes[order._id]?.formatted || 'About 45 minutes'}</p>
          </div>
        `)
        .openPopup();

      window.L.polyline([
        [STORE_COORDINATES.lat, STORE_COORDINATES.lng],
        [coordinates.lat, coordinates.lng]
      ], {
        color: '#FF5733',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
      }).addTo(map);

      return map;
    } catch (error) {
      console.error("Error initializing map:", error);
      return null;
    }
  };

  useEffect(() => {
    let scriptLoadTimer = null;

    // Font Awesome map icons
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(fontAwesome);

    if (!document.querySelector('script[src*="leaflet"]')) {
      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(leafletCss);

      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
      document.body.appendChild(leafletScript);

      scriptLoadTimer = setTimeout(() => {
        if (!window.L) {
          console.warn("Map scripts failed to load in a timely manner");
          setLoading(false);
        }
      }, 10000); // 10 second timeout

      leafletScript.onload = () => {
        clearTimeout(scriptLoadTimer);

        try {
          const maplibreScript = document.createElement('script');
          maplibreScript.src = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.js';
          document.body.appendChild(maplibreScript);

          maplibreScript.onload = () => {
            const maplibreCss = document.createElement('link');
            maplibreCss.rel = 'stylesheet';
            maplibreCss.href = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css';
            document.head.appendChild(maplibreCss);

            const maplibreLeafletScript = document.createElement('script');
            maplibreLeafletScript.src = 'https://unpkg.com/@maplibre/maplibre-gl-leaflet/leaflet-maplibre-gl.js';
            document.body.appendChild(maplibreLeafletScript);
          };
        } catch (error) {
          console.warn("Error loading MapLibre scripts:", error);
        }

        if (data.length > 0) {
          const orderToDisplay = data.find(order => order._id === selectedOrderId) || data[0];
          initializeMap(orderToDisplay);
        }
      };
    } else {
      // Initialize map have data
      if (data.length > 0 && window.L) {
        const orderToDisplay = data.find(order => order._id === selectedOrderId) || data[0];
        initializeMap(orderToDisplay);
      }
    }

    return () => {
      // Clean up map instance on component unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Clear timeout if component unmounts
      if (scriptLoadTimer) {
        clearTimeout(scriptLoadTimer);
      }
    };
  }, []); // Only run once on mount

  // Update map when data or selectedOrderId changes
  useEffect(() => {
    if (data.length > 0 && window.L) {
      const orderToDisplay = data.find(order => order._id === selectedOrderId) || data[0];
      if (orderToDisplay) {
        initializeMap(orderToDisplay);
      }
    }
  }, [data, selectedOrderId]);

  useEffect(() => {
    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders();
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(intervalId); // Cleanup on unmount
    };
  }, []);

  return (
    <div className="track-order add">
      <ToastContainer />
      <h3>Track Orders</h3>

      {loading ? (
        <div className="loading-spinner">Loading order data...</div>
      ) : (
        <div className="track-order-container">
          {/* Map container */}
          <div id="map-container" className="map-container"></div>

          {/* Orders list */}
          <div className="orders-list">
            {data.length > 0 ? (
              data.map((order, index) => (
                <div
                  key={index}
                  className={`order-item ${selectedOrderId === order._id ? 'order-item-selected' : ''}`}
                  onClick={() => initializeMap(order)}
                >
                  <img src={assets.parcel_icon} alt="Parcel Icon" />
                  <div className="order-details">
                    <p className="order-items">
                      {order.items.map((item, idx) =>
                        `${item.name} x ${item.quantity}${idx < order.items.length - 1 ? ', ' : ''}`
                      )}
                    </p>
                    <p className="order-item-name">{order.address.firstname + " " + order.address.lastname}</p>
                    <div className="order-item-address">
                      <p>{order.address.street}</p>
                      <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
                    </div>
                    <p className="order-price">₫{order.amount}.00</p>
                    <p className="order-count">Items: {order.items.length}</p>
                    <div className="order-status">
                      <span className="status-dot">&#x25cf; </span>
                      <b>{order.status}</b>
                    </div>
                    <div className="delivery-time">
                      Estimated Delivery Time: {deliveryTimes[order._id]?.formatted || 'About 45 minutes'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-orders">No orders available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;