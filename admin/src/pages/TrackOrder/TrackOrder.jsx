import React, { useEffect, useState, useRef } from 'react';
import './TrackOrder.css';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSearchParams } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const TrackOrder = ({ url }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
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
        formatted: 'About 45 minutes'
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
        formattedTime = `About ${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else {
        formattedTime = `About ${hours} hour${hours > 1 ? 's' : ''}`;
      }
    } else {
      formattedTime = `About ${totalMinutes} minutes`;
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

  // Fetch all orders from API (admin gets all orders)
  const fetchOrders = async () => {
    try {
      const response = await axios.get(url + "/api/order/list");
      if (response.data.success) {
        const ordersData = response.data.data;
        setData(ordersData);

        // Calculate delivery time for each order
        const times = {};
        ordersData.forEach(order => {
          times[order._id] = calculateDeliveryTime(order.coordinates);
        });
        setDeliveryTimes(times);

        // Set selected order ID
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
                  <h3>4784Food Store</h3>
                  <p>Main restaurant location</p>
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
                  <h3>Delivery Address</h3>
                  <p>${order.address.street || ''}, ${order.address.city || ''}</p>
                  <p>${order.address.state || ''}, ${order.address.country || ''}</p>
                  <p><strong>Status:</strong> ${order.status || 'Processing'}</p>
                  <p><strong>Estimated Delivery Time:</strong> ${deliveryTimes[order._id]?.formatted || 'About 45 minutes'}</p>
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
    fetchOrders();

    // Set up interval to refresh order status periodically
    const intervalId = setInterval(() => {
      fetchOrders();
    }, 180000); // Check every 3 minutes

    return () => {
      clearInterval(intervalId); // Cleanup on unmount
    };
  }, []);

  // Handle case when selected order is not found
  const orderToDisplay = data.find(order => order._id === selectedOrderId);
  if (!orderToDisplay && data.length > 0) {
    setSelectedOrderId(data[0]._id);
  }

  return (
    <div className="track-order">
      <ToastContainer />
      <h3>Track Orders (Admin)</h3>

      {loading ? (
        <div className="loading-spinner">Loading orders...</div>
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
                        <p className="order-count">Items: {order.items.length}</p>
                        <div className="order-status">
                          <span className="status-dot">&#x25cf; </span>
                          <b>{order.status}</b>
                        </div>
                      </div>
                    </div>

                    <div className="order-payment-info">
                      <p><strong>Payment Method:</strong> {order.paymentMethod === 'vnpay' ? 'VNPay' : 'Cash on Delivery'}</p>
                      <p className={`payment-status ${order.payment ? 'paid' : 'unpaid'}`}>
                        <strong>Payment Status:</strong> {order.payment ? 'Paid' : 'Unpaid'}
                      </p>
                    </div>

                    <div className="delivery-time">
                      Estimated Delivery Time: {deliveryTimes[order._id]?.formatted || 'About 45 minutes'}
                    </div>

                    <div className="order-address">
                      <p><strong>Customer:</strong> {order.address.firstName} {order.address.lastName}</p>
                      <p><strong>Phone:</strong> {order.address.phone}</p>
                      <p><strong>Email:</strong> {order.address.email}</p>
                      <p><strong>Address:</strong> {order.address.street}, {order.address.city}</p>
                      <p>{order.address.state}, {order.address.country} {order.address.zipCode}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-orders">No orders found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;