import React from 'react'
import './AppDownload.css'
import { assets } from '../../assets/assets'
import { useTranslation } from 'react-i18next';

const AppDownload = () => {
  const { t } = useTranslation();
  
  return (
    <div className='app-download' id='app-download'>
        <p>{t('appDownload.description')}</p>
        <div className="app-download-plateforms">
            <img src={assets.play_store} alt="" />
            <img src={assets.app_store} alt="" />
        </div>
    </div>
  )
}

export default AppDownload