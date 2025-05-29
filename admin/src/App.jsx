import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Route, Routes } from 'react-router-dom'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import WelcomePage from './pages/WelcomePage/WelcomePage'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import TrackOrder from './pages/TrackOrder/TrackOrder'
import CouponManagement from './pages/CouponManagement/CouponManagement'
import './App.css'

const App = () => {
    const url = "http://localhost:3000"

    return (
        <>
            <ToastContainer/>
            <Navbar/>
            <hr />
            <div className="app-content">
                <Sidebar/>
                <Routes>
                    <Route path='/' element={<WelcomePage url={url}/>} />
                    <Route path='/list' element={<List url={url}/>} />
                    <Route path='/orders' element={<Orders url={url}/>} />
                    <Route path='/trackorder' element={<TrackOrder url={url}/>} />
                    <Route path='/coupons' element={<CouponManagement url={url}/>} />
                </Routes>
            </div>
        </>
    )
}

export default App