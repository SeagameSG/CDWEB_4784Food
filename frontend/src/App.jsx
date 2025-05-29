import React, { useState } from 'react'
import Navbar from './components/navbar/Navbar'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import AppDownload from './components/AppDownload/AppDownload'
import LoginPopUp from './components/LoginPopUp/LoginPopUp'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import TrackOrder from './pages/TrackOrder/TrackOrder'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {showLogin ? <LoginPopUp setShowLogin={setShowLogin} /> : <></>}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<Home />} />
          <Route path="/verify" element={<Verify />} />
          
          {/* Protected Routes */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          
          <Route path="/order" element={
            <ProtectedRoute>
              <PlaceOrder />
            </ProtectedRoute>
          } />
          
          <Route path="/myorders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />
          
          <Route path="/trackorder" element={
            <ProtectedRoute>
              <TrackOrder />
            </ProtectedRoute>
          } />
          
          <Route path="/ProfilePage" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <AppDownload />
      <Footer />
    </>
  )
}

export default App