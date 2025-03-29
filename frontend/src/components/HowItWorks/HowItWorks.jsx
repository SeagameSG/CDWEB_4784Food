import React from "react";
import "./HowItWorks.css";
import { assets } from "../../assets/assets";

const HowItWorks = () => {

  // Step data with images
  const steps = [
    {
      id: 1,
      image: assets.howitworks_img1,
      title: "Chọn món",
      description: "Chọn món ăn mà bạn muốn."
    },
    {
      id: 2,
      image: assets.howitworks_img2,
      title: "Chọn cách chế biến",
      description: "Nếu bạn muốn gì đó đặc biệt."
    },
    {
      id: 3,
      image: assets.howitworks_img3,
      title: "Giao hàng",
      description: "Món ăn sẽ đến với bạn trong khoảng 15 phút."
    }
  ];

  return (
    <div className="how-it-works-container">
      <p className="works-title">Quy trình</p>
      <h2 className="title">Cách hoạt động</h2>
      <p className="description">
        Món ăn của bạn là trách nhiệm của chúng tôi <br />Đảm bảo đổi trả hoàn tiền.
      </p>
      <div className="steps-container">
        {steps.map((step) => (
          <div key={step.id} className="step-card">
            {/* Render images if it's an array */}
            {Array.isArray(step.images) ? (
              <div className="step-images">
                {step.images.map((image, index) => (
                  <img key={index} src={image} alt={`${step.title} - ${index}`} className="step-image" />
                ))}
              </div>
            ) : (
              <img src={step.image} alt={step.title} className="step-image" />
            )}
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
