import React, { useContext, useEffect, useState, useRef } from 'react';
import './TrackOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

const TrackOrder = () => {
  const { t } = useTranslation();
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || null);
  const mapContainerRef = useRef(null);
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
        formatted: t('trackOrder.defaultDeliveryTime')
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
        formattedTime = t('trackOrder.hoursAndMinutes', { hours, minutes });
      } else {
        formattedTime = t('trackOrder.hoursOnly', { hours });
      }
    } else {
      formattedTime = t('trackOrder.minutesOnly', { minutes: totalMinutes });
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
    const response = await axios.post(
      url + "/api/order/userorders", 
      {}, 
      { headers: { token } }
    );
    
    const ordersData = response.data.data;
    setData(ordersData);

    if (orderId) {
      const orderExists = ordersData.some(order => order._id === orderId);
      if (orderExists) {
        setSelectedOrderId(orderId);
      } else {
        if (ordersData.length > 0) {
          setSelectedOrderId(ordersData[0]._id);
          toast.warning(t('trackOrder.orderNotFound'));
        }
      }
    } else if (ordersData.length > 0) {
      setSelectedOrderId(ordersData[0]._id);
    }
    
    setLoading(false);
  } catch (error) {
    console.error("Error fetching orders:", error);
    toast.error(t('trackOrder.errorFetchingOrders'));
    setLoading(false);
  }
};

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

      // Create Leaflet map with bounds
      const map = window.L.map('map-container', {
        center: [
          (STORE_COORDINATES.lat + coordinates.lat) / 2,
          (STORE_COORDINATES.lng + coordinates.lng) / 2
        ],
        zoom: 12
      });

      map.fitBounds(bounds, { padding: [50, 50] });

      // Store the map instance for later cleanup
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

      // Add store marker
      const storeIcon = window.L.divIcon({
        html: `<div class="store-marker"><i class="fas fa-store"></i></div>`,
        className: 'store-icon',
        iconSize: [30, 30]
      });

      const storeMarker = window.L.marker([STORE_COORDINATES.lat, STORE_COORDINATES.lng], {
        icon: storeIcon
      })
        .addTo(map)
        .bindPopup(`
          <div class="map-popup store-popup">
            <h3>${t('trackOrder.storeName')}</h3>
            <p>${t('trackOrder.storeDescription')}</p>
          </div>
        `);

      // Add delivery location marker
      const deliveryIcon = window.L.divIcon({
        html: `<div class="delivery-marker"><i class="fas fa-map-marker"></i></div>`,
        className: 'delivery-icon',
        iconSize: [30, 30]
      });

      const deliveryMarker = window.L.marker([coordinates.lat, coordinates.lng], {
        icon: deliveryIcon
      })
        .addTo(map)
        .bindPopup(`
          <div class="map-popup">
            <h3>${t('trackOrder.deliveryAddress')}</h3>
            <p>${order.address.street || ''}, ${order.address.city || ''}</p>
            <p>${order.address.state || ''}, ${order.address.country || ''}</p>
            <p><strong>${t('trackOrder.status')}:</strong> ${order.status || t('trackOrder.processing')}</p>
            <p><strong>${t('trackOrder.estimatedDeliveryTime')}:</strong> ${deliveryTimes[order._id]?.formatted || t('trackOrder.defaultDeliveryTime')}</p>
          </div>
        `)
        .openPopup();

      // Draw a line between store and delivery location
      const polyline = window.L.polyline([
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
    let scriptsLoaded = false;
    let scriptLoadTimer = null;

    // Add Font Awesome for map icons
    const fontAwesome = document.createElement('link');
    fontAwesome.rel = 'stylesheet';
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
    document.head.appendChild(fontAwesome);

    // Check if scripts are already loaded
    if (!document.querySelector('script[src*="leaflet"]')) {
      // Add Leaflet CSS
      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet/dist/leaflet.css';
      document.head.appendChild(leafletCss);

      // Add Leaflet JS first, and only add MapLibre if needed
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet/dist/leaflet.js';
      document.body.appendChild(leafletScript);

      // Set a timeout to prevent waiting forever if scripts fail to load
      scriptLoadTimer = setTimeout(() => {
        if (!window.L) {
          console.warn("Map scripts failed to load in a timely manner");
          setLoading(false);
        }
      }, 10000); // 10 second timeout

      // After Leaflet loads
      leafletScript.onload = () => {
        // We can technically initialize a basic map with just Leaflet
        scriptsLoaded = true;
        clearTimeout(scriptLoadTimer);

        // Try to load MapLibre for enhanced maps, but we can fall back to standard Leaflet
        try {
          const maplibreScript = document.createElement('script');
          maplibreScript.src = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.js';
          document.body.appendChild(maplibreScript);

          // After MapLibre GL loads, add the Leaflet plugin
          maplibreScript.onload = () => {
            // Add MapLibre GL CSS
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
      scriptsLoaded = true;

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

  useEffect(() => {
    if (data.length > 0 && window.L) {
      const orderToDisplay = data.find(order => order._id === selectedOrderId) || data[0];
      initializeMap(orderToDisplay);
    }
  }, [data, selectedOrderId]);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }

    if (success === "true") {
      toast.success(t('trackOrder.paymentSuccess'), {
        position: "top-center",
        autoClose: 5000,
      });
    }

    // Set up interval to refresh order status periodically
    const intervalId = setInterval(() => {
      if (token) {
        fetchOrders();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(intervalId); // Cleanup on unmount
    };
  }, [token]);

  const orderToDisplay = data.find(order => order._id === selectedOrderId);
  if (!orderToDisplay && data.length > 0) {
    setSelectedOrderId(data[0]._id);
  }

  return (
    <div className="track-order">
      <ToastContainer />
      <h2>{t('trackOrder.title')}</h2>

      {loading ? (
        <div className="loading-spinner">{t('trackOrder.loading')}</div>
      ) : (
        <div className="track-order-container">
          {/* Map container */}
          <div id="map-container" ref={mapContainerRef} className="map-container"></div>

          {/* Orders list */}
          <div className="orders-list">
            {data.length > 0 ? (
              data.map((order, index) => (
                <div
                  key={index}
                  className={`order-item ${selectedOrderId === order._id ? 'order-item-selected' : ''}`}
                  onClick={() => initializeMap(order)}
                >
                  <div className="order-details">
                    <div className="order-detail-info">
                      <img src={assets.parcel_icon} alt="" />

                      <div className="order-detail-info-item">
                        <p className="order-items">
                          {order.items.map((item, idx) =>
                              `${item.name} x ${item.quantity}${idx < order.items.length - 1 ? ', ' : ''}`
                          )}
                        </p>
                        <p className="order-price">₫{order.amount}.00</p>

                      </div>
                        <div className="order-detail-info-status">
                          <p className="order-count">{t('trackOrder.items')} {order.items.length}</p>
                          <div className="order-status">
                            <span className="status-dot">&#x25cf; </span>
                            <b>{order.status}</b>
                          </div>
                        </div>
                    </div>
                    <div className="order-payment-info">
                      <p><strong>{t('trackOrder.paymentMethodLabel')}:</strong> {order.paymentMethod === 'vnpay' ? 
                        t('trackOrder.paymentMethod.vnpay') : 
                        t('trackOrder.paymentMethod.cod')}
                      </p>
                      <p className={`payment-status ${order.payment ? 'paid' : 'unpaid'}`}>
                        <strong>{t('trackOrder.paymentStatusLabel')}:</strong> {order.payment ?
                          t('trackOrder.paymentStatus.paid') : 
                          t('trackOrder.paymentStatus.unpaid')}
                      </p>
                    </div>
                    <div className="delivery-time">
                      {t('trackOrder.estimatedDeliveryTime')}: {deliveryTimes[order._id]?.formatted || t('trackOrder.defaultDeliveryTime')}
                    </div>
                    <div className="order-address">
                      <p><strong>{t('trackOrder.deliveryAddress')}</strong></p>
                      <p>{order.address.street}, {order.address.city}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-orders">{t('trackOrder.noOrders')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;