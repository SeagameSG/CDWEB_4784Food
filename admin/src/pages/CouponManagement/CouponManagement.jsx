import React, { useEffect, useState } from "react";
import "../List/List.css";
import "./CouponManagement.css";
import axios from "axios";
import { toast } from "react-toastify";

const CouponManagement = ({ url }) => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" hoặc "edit"
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    discountPercentage: "",
    applicableCategories: ["ALL"],
    used: false
  });
  const [availableCategories, setAvailableCategories] = useState([]);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${url}/api/coupon/admin/list`);
      if (response.data.success) {
        setCoupons(response.data.data);
      } else {
        toast.error("Không thể lấy danh sách mã giảm giá");
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu mã giảm giá");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        const categories = [...new Set(response.data.data.map(item => item.category))];
        setAvailableCategories(["ALL", ...categories]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const removeCoupon = async (couponId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) {
      try {
        const response = await axios.delete(`${url}/api/coupon/admin/delete/${couponId}`);
        if (response.data.success) {
          toast.success("Đã xóa mã giảm giá");
          fetchCoupons();
        } else {
          toast.error(response.data.message || "Lỗi khi xóa mã giảm giá");
        }
      } catch (error) {
        toast.error("Không thể xóa mã giảm giá");
      }
    }
  };

  const openAddModal = () => {
    setModalType("add");
    setSelectedCoupon(null);
    setFormData({
      name: "",
      discountPercentage: "",
      applicableCategories: ["ALL"],
      used: false
    });
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setModalType("edit");
    setSelectedCoupon(coupon);
    setFormData({
      name: coupon.name,
      discountPercentage: coupon.discountPercentage,
      applicableCategories: coupon.applicableCategories,
      used: coupon.used
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        used: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryChange = (category) => {
    const currentCategories = [...formData.applicableCategories];
    
    if (category === "ALL") {
      setFormData(prev => ({
        ...prev,
        applicableCategories: ["ALL"]
      }));
      return;
    }
    
    if (currentCategories.includes("ALL")) {
      currentCategories.splice(currentCategories.indexOf("ALL"), 1);
    }
    
    if (currentCategories.includes(category)) {
      const newCategories = currentCategories.filter(cat => cat !== category);
      if (newCategories.length === 0) {
        newCategories.push("ALL");
      }
      setFormData(prev => ({
        ...prev,
        applicableCategories: newCategories
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        applicableCategories: [...currentCategories, category]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      if (modalType === "add") {
        response = await axios.post(`${url}/api/coupon/admin/create`, formData);
      } else {
        response = await axios.put(`${url}/api/coupon/admin/update/${selectedCoupon._id}`, formData);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setShowModal(false);
        fetchCoupons();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi xử lý yêu cầu");
    }
  };

  useEffect(() => {
    fetchCoupons();
    fetchCategories();
  }, []);

  return (
    <div className="list add flex-col">
      <div className="list-header">
        <p>Quản lý mã giảm giá</p>
        <button className="add-btn" onClick={openAddModal}>
          Thêm mã giảm giá mới
        </button>
      </div>
      
      <div className="list-table">
        <div className="list-table-format title coupon-table-header">
          <b>Mã giảm giá</b>
          <b>% Giảm giá</b>
          <b>Danh mục áp dụng</b>
          <b>Đã sử dụng</b>
          <b>Thao tác</b>
        </div>
        {coupons.map((coupon) => (
          <div key={coupon._id} className="list-table-format coupon-row">
            <p>{coupon.name}</p>
            <p>{coupon.discountPercentage}%</p>
            <p className="categories-cell">
              {coupon.applicableCategories.includes("ALL") 
                ? "Tất cả danh mục" 
                : coupon.applicableCategories.join(", ")}
            </p>
            <p>{coupon.used ? "Đã sử dụng" : "Chưa sử dụng"}</p>
            <div className="action-buttons">
              <button onClick={() => openEditModal(coupon)} className="edit-btn">
                Sửa
              </button>
              <button onClick={() => removeCoupon(coupon._id)} className="remove-btn">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm/Sửa Mã Giảm Giá */}
      {showModal && (
        <div className="food-modal-overlay">
          <div className="food-modal">
            <div className="food-modal-header">
              <h2>{modalType === "add" ? "Thêm mã giảm giá mới" : "Cập nhật mã giảm giá"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="food-form">
              <div className="form-group">
                <label>Tên mã giảm giá</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phần trăm giảm giá (%)</label>
                <input 
                  type="number" 
                  name="discountPercentage" 
                  min="0"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Danh mục áp dụng</label>
                <div className="categories-checkbox-group">
                  {availableCategories.map(category => (
                    <div key={category} className="category-checkbox">
                      <input 
                        type="checkbox"
                        id={`category-${category}`}
                        checked={formData.applicableCategories.includes(category)}
                        onChange={() => handleCategoryChange(category)}
                      />
                      <label htmlFor={`category-${category}`}>{category}</label>
                    </div>
                  ))}
                </div>
              </div>

              {modalType === "edit" && (
                <div className="form-group">
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      name="used"
                      checked={formData.used}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Đã sử dụng
                  </label>
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit">{modalType === "add" ? "Thêm" : "Cập nhật"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;