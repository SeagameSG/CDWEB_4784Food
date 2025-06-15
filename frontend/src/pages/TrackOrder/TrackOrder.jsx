import React, { useContext, useEffect, useState, useRef } from 'react';
import './TrackOrder.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { useSearchParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const TrackOrder = () => {
  const { t } = useTranslation();
  const { url, token } = useContext(StoreContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  
  const [deliveryTimes, setDeliveryTimes] = useState({});

  // API Keys from environment variables
  const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY;
  const OPENROUTESERVICE_KEY = import.meta.env.VITE_OPENROUTESERVICE_KEY;

  // Default coordinates 4784Food
  const STORE_COORDINATES = { lat: 10.883700, lng: 106.784002 };
  
  const DEFAULT_COORDINATES = { lat: 10.8231, lng: 106.6297 };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (coords1, coords2) => {
    const R = 6371; // Earth's radius in km
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

  // Calculate estimated delivery time based on distance
  const calculateDeliveryTime = (orderCoordinates) => {
    if (!validateCoordinates(orderCoordinates)) {
      return {
        minutes: 45,
        formatted: t('trackOrder.defaultDeliveryTime')
      };
    }

    const distance = calculateDistance(STORE_COORDINATES, orderCoordinates);

    // Assume average speed of 0.5 km/minute (30 km/h)
    const travelTime = distance / 0.5;
    // Add 20 minutes for food preparation
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

  // Validate coordinates to ensure they are valid
  const validateCoordinates = (coords) => {
    if (!coords) return false;
    if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return false;
    if (isNaN(coords.lat) || isNaN(coords.lng)) return false;
    if (coords.lat < -90 || coords.lat > 90) return false;
    if (coords.lng < -180 || coords.lng > 180) return false;
    return true;
  };

  // Fetch route data from OpenRouteService
  const fetchRoute = async (start, end) => {
    try {
      const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
        {
          coordinates: [[start.lng, start.lat], [end.lng, end.lat]],
          format: 'geojson'
        },
        {
          headers: {
            'Authorization': OPENROUTESERVICE_KEY,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching route:', error);
      // Return null if routing fails, we'll fall back to straight line
      return null;
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        url + "/api/order/userorders", 
        {}, 
        { headers: { token } }
      );
      
      const ordersData = response.data.data;
      setData(ordersData);

      // Calculate delivery time for each order
      const newDeliveryTimes = {};
      ordersData.forEach(order => {
        newDeliveryTimes[order._id] = calculateDeliveryTime(order.coordinates);
      });
      setDeliveryTimes(newDeliveryTimes);

      // Set selected order ID
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

  // Initialize MapLibre map with MapTiler
  const initializeMap = async (order) => {
    if (!order) return;

    setSelectedOrderId(order._id);

    // Clean up existing map if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Set coordinates, use default if invalid
    let coordinates = DEFAULT_COORDINATES;
    if (validateCoordinates(order.coordinates)) {
      coordinates = order.coordinates;
    } else {
      console.warn("Invalid coordinates in order, using default coordinates");
    }

    try {
      // Create new MapLibre map
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
        center: [
          (STORE_COORDINATES.lng + coordinates.lng) / 2,
          (STORE_COORDINATES.lat + coordinates.lat) / 2
        ],
        zoom: 12
      });

      // Store map reference for cleanup
      mapRef.current = map;

      // Add navigation controls
      map.addControl(new maplibregl.NavigationControl(), 'top-right');

      // Wait for map to load before adding markers and route
      map.on('load', async () => {
        // Fit map to show both store and delivery locations
        const bounds = new maplibregl.LngLatBounds()
          .extend([STORE_COORDINATES.lng, STORE_COORDINATES.lat])
          .extend([coordinates.lng, coordinates.lat]);
        
        map.fitBounds(bounds, { padding: 100 });

        // Add store marker
        const storeEl = document.createElement('div');
        storeEl.className = 'store-marker';
        storeEl.innerHTML = '<i class="fas fa-store"></i>';

        new maplibregl.Marker(storeEl)
          .setLngLat([STORE_COORDINATES.lng, STORE_COORDINATES.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 25 })
              .setHTML(`
                <div class="map-popup store-popup">
                  <h3>${t('trackOrder.storeName')}</h3>
                  <p>${t('trackOrder.storeDescription')}</p>
                </div>
              `)
          )
          .addTo(map);

        // Add delivery location marker
        const deliveryEl = document.createElement('div');
        deliveryEl.className = 'delivery-marker';
        deliveryEl.innerHTML = '<i class="fas fa-map-marker"></i>';

        new maplibregl.Marker(deliveryEl)
          .setLngLat([coordinates.lng, coordinates.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 25 })
              .setHTML(`
                <div class="map-popup">
                  <h3>${t('trackOrder.deliveryAddress')}</h3>
                  <p>${order.address.street || ''}, ${order.address.city || ''}</p>
                  <p>${order.address.state || ''}, ${order.address.country || ''}</p>
                  <p><strong>${t('trackOrder.status')}:</strong> ${order.status || t('trackOrder.processing')}</p>
                  <p><strong>${t('trackOrder.estimatedDeliveryTime')}:</strong> ${deliveryTimes[order._id]?.formatted || t('trackOrder.defaultDeliveryTime')}</p>
                </div>
              `)
          )
          .addTo(map);

        // Fetch and add route from OpenRouteService
        try {
          const routeData = await fetchRoute(STORE_COORDINATES, coordinates);
          
          if (routeData && routeData.features && routeData.features.length > 0) {
            // Add the actual route from OpenRouteService
            map.addSource('route', {
              'type': 'geojson',
              'data': routeData
            });

            map.addLayer({
              'id': 'route',
              'type': 'line',
              'source': 'route',
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': '#FF5733',
                'line-width': 4,
                'line-opacity': 0.8
              }
            });

            // Fit map to show the entire route
            const routeBounds = new maplibregl.LngLatBounds();
            routeData.features[0].geometry.coordinates.forEach(coord => {
              routeBounds.extend(coord);
            });
            map.fitBounds(routeBounds, { padding: 50 });
          } else {
            // Fallback to straight line if routing fails
            console.warn('Route data not available, using straight line');
            map.addSource('route', {
              'type': 'geojson',
              'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                  'type': 'LineString',
                  'coordinates': [
                    [STORE_COORDINATES.lng, STORE_COORDINATES.lat],
                    [coordinates.lng, coordinates.lat]
                  ]
                }
              }
            });

            map.addLayer({
              'id': 'route',
              'type': 'line',
              'source': 'route',
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': '#FF5733',
                'line-width': 3,
                'line-opacity': 0.7,
                'line-dasharray': [2, 2]
              }
            });
          }
        } catch (error) {
          console.error('Error adding route to map:', error);
        }
      });

      return map;
    } catch (error) {
      console.error("Error initializing map:", error);
      return null;
    }
  };

  // Load FontAwesome for map icons
  useEffect(() => {
    // Add Font Awesome for map icons if not already loaded
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
      document.head.appendChild(fontAwesome);
    }
  }, []);

  // Initialize map when data is loaded
  useEffect(() => {
    if (data.length > 0) {
      const orderToDisplay = data.find(order => order._id === selectedOrderId) || data[0];
      initializeMap(orderToDisplay);
    }
  }, [data, selectedOrderId]);

  // Clean up map on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Fetch orders when component mounts
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
    }, 180000); // Check every 3 minutes

    return () => {
      clearInterval(intervalId); // Cleanup on unmount
    };
  }, [token]);

  // Handle case when selected order is not found
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
          <div id="map-container" className="map-container" ref={mapContainerRef}></div>

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