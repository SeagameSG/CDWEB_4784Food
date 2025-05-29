import React, { useContext } from 'react'
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { useTranslation } from 'react-i18next';

const FoodDisplay = ({category}) => {
    const { t } = useTranslation();
    const {food_list} = useContext(StoreContext);
    if(!food_list) {
        return <p>{t('foodDisplay.loading')}</p>;
    }

  return (
    <div>
        <div className="food-display" id='food_display'>
            <h2>{t('foodDisplay.title')}</h2>
            <div className="food-display-list">
              {food_list.map((item,index) => {
                  if (category==="All" || category===item.category) {
                    return <FoodItem key={index} id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} />
                  }
              })}
            </div>
        </div>
    </div>
  )
}

export default FoodDisplay