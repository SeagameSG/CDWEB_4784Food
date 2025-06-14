import React, { useContext, useEffect, useState } from 'react'
import './FoodItem.css';
import { assets } from '../../assets/assets.js';
import { StoreContext } from '../../context/StoreContext.jsx';
import axios from 'axios';

const FoodItem = ({id,name,price,description,image}) => {
    const {cartItems, addToCart, removeFromCart, url} = useContext(StoreContext);
    const [rating, setRating] = useState(0);

    // Fetch rating for this food item
    useEffect(() => {
        const fetchRating = async () => {
            try {
                const response = await axios.get(`${url}/api/review/rating/${id}`);
                if (response.data.success) {
                    setRating(response.data.data.averageRating);
                }
            } catch (error) {
                console.error("Error fetching rating:", error);
            }
        };
        fetchRating();
    }, [id, url]);

    const renderStars = (rating) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    return (
        <div className='food-item'>
            <div className="food-item-img-container">
                <img className='food-item-image' src={url+"/images/"+image} alt="" /> 
                {!cartItems[id]
                    ?<img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
                    :<div className='food-item-counter'>
                        <img onClick={() => removeFromCart(id)} src={assets.remove_icon_red} alt="" />
                        <p>{cartItems[id]}</p>
                        <img onClick={() => addToCart(id)} src={assets.add_icon_green} alt="" />
                    </div>
                }
            </div>
            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <div className="rating-stars">
                        {renderStars(rating)}
                    </div>
                </div>
                <p className='food-item-desc'>{description}</p>
                <p className='food-item-price'>₫{price}.00</p>
            </div>
        </div>
    )
}

export default FoodItem