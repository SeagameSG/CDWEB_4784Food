import React from "react";
import "./HowItWorks.css";
import { assets } from "../../assets/assets";
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();

  // Step data with images - now using translations
  const steps = [
    {
      id: 1,
      image: assets.howitworks_img1,
      titleKey: 'howItWorks.steps.step1.title',
      descriptionKey: 'howItWorks.steps.step1.description'
    },
    {
      id: 2,
      image: assets.howitworks_img2,
      titleKey: 'howItWorks.steps.step2.title',
      descriptionKey: 'howItWorks.steps.step2.description'
    },
    {
      id: 3,
      image: assets.howitworks_img3,
      titleKey: 'howItWorks.steps.step3.title',
      descriptionKey: 'howItWorks.steps.step3.description'
    }
  ];

  return (
    <div className="how-it-works-container">
      <p className="works-title">{t('howItWorks.process')}</p>
      <h2 className="title">{t('howItWorks.title')}</h2>
      <p className="description" dangerouslySetInnerHTML={{ __html: t('howItWorks.description') }} />
      <div className="steps-container">
        {steps.map((step) => (
          <div key={step.id} className="step-card">
            {/* Render images if it's an array */}
            {Array.isArray(step.images) ? (
              <div className="step-images">
                {step.images.map((image, index) => (
                  <img key={index} src={image} alt={`${t(step.titleKey)} - ${index}`} className="step-image" />
                ))}
              </div>
            ) : (
              <img src={step.image} alt={t(step.titleKey)} className="step-image" />
            )}
            <h3 className="step-title">{t(step.titleKey)}</h3>
            <p className="step-description">{t(step.descriptionKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
