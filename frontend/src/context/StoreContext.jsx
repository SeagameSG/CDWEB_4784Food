import axios from 'axios';
import {createContext, useEffect, useState} from 'react'

export const StoreContext = createContext(null)

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const url = "http://localhost:3000"
    const [token, setToken] = useState("");
    const [food_list, setFoodList] = useState([]);
    const [couponDiscount, setCouponDiscount] = useState({
        appliedCoupon: null,
        discountAmount: 0,
        affectedCategories: ""
    });

    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev)=> ({...prev,[itemId]:1}))
        }
        else
        {
            setCartItems((prev) => ({...prev,[itemId]:prev[itemId]+1}))
        }
        if (token) {
            await axios.post(url+"/api/cart/add",{itemId},{headers:{token}})
        }
        resetCoupon();
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({...prev,[itemId]:prev[itemId]-1}));
        if (token) {
            await axios.post(url+"/api/cart/remove",{itemId},{headers:{token}})
        }
        resetCoupon();
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for(const item in cartItems )
        {
            if(cartItems[item] > 0){
                let itemInfo = food_list.find((product) => product._id === item )
                totalAmount += itemInfo.price*cartItems[item];
            }
        }
        return totalAmount;
    }

    const getTotalWithDiscount = () => {
        // If no coupon applied, return regular total
        if (!couponDiscount.appliedCoupon) {
            return getTotalCartAmount();
        }
        
        return Math.max(0, getTotalCartAmount() - couponDiscount.discountAmount);
    }

    const applyCoupon = async (couponCode) => {
        try {
            const response = await axios.post(
                `${url}/api/coupon/validate`, 
                { 
                    couponCode, 
                    cartItems 
                },
                { headers: { token } }
            );
            
            if (response.data.success) {
                setCouponDiscount({
                    appliedCoupon: response.data.data.coupon,
                    discountAmount: response.data.data.discountAmount,
                    affectedCategories: response.data.data.affectedCategories
                });
                return {
                    success: true,
                    message: response.data.message,
                    data: response.data.data
                };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error("Error applying coupon:", error);
            return { 
                success: false, 
                message: error.response?.data?.message || "Lỗi khi áp dụng mã giảm giá" 
            };
        }
    }

    const markCouponAsUsed = async () => {
        if (!couponDiscount.appliedCoupon) return;
        
        try {
            await axios.post(
                `${url}/api/coupon/mark-used`, 
                { couponCode: couponDiscount.appliedCoupon.name },
                { headers: { token } }
            );
        } catch (error) {
            console.error("Error marking coupon as used:", error);
        }
    }

    const resetCoupon = () => {
        setCouponDiscount({
            appliedCoupon: null,
            discountAmount: 0,
            affectedCategories: ""
        });
    }

    const fetchFoodList = async() => {
        const response = await axios.get(url +"/api/food/list");
        setFoodList(response.data.data)
    }

    const loadtCartData = async (token) => {
        const response = await axios.post(url +"/api/cart/get",{},{headers:{token}});
        setCartItems(response.data.cartData);
    }

    useEffect(()=>{
        async function loadData() {
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"))
                await loadtCartData(localStorage.getItem("token"));
            }
        }
        loadData();
    },[])

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        getTotalWithDiscount,
        applyCoupon,
        resetCoupon,
        markCouponAsUsed,
        couponDiscount,
        url, 
        token, 
        setToken
    };


    return (
        <StoreContext.Provider value={contextValue} >
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;