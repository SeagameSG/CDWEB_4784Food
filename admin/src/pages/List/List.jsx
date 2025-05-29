import React, { useEffect, useState } from "react";
import "./List.css";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // "add" hoặc "edit"
  const [selectedFood, setSelectedFood] = useState(null);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Salad",
  });

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Data not found");
      }
    } catch (error) {
      toast.error("Error fetching data");
    }
  };

  const removeFood = async (foodId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa món ăn này?")) {
      try {
        const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
        if (response.data.success) {
          toast.success(response.data.message);
          fetchList();
        } else {
          toast.error(response.data.message || "Error removing item");
        }
      } catch (error) {
        toast.error("Request failed");
      }
    }
  };

  const openAddModal = () => {
    setModalType("add");
    setSelectedFood(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Salad",
    });
    setImage(null);
    setShowModal(true);
  };

  const openEditModal = async (foodId) => {
    try {
      const response = await axios.get(`${url}/api/food/get/${foodId}`);
      if (response.data.success) {
        const food = response.data.data;
        setSelectedFood(food);
        setFormData({
          name: food.name,
          description: food.description,
          price: food.price,
          category: food.category,
        });
        setImage(null);
        setModalType("edit");
        setShowModal(true);
      } else {
        toast.error("Không thể lấy thông tin món ăn");
      }
    } catch (error) {
      toast.error("Lỗi khi lấy dữ liệu món ăn");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", Number(formData.price));
    formDataToSend.append("category", formData.category);
    
    if (image) {
      formDataToSend.append("image", image);
    }

    try {
      let response;
      if (modalType === "add") {
        response = await axios.post(`${url}/api/food/add`, formDataToSend);
      } else {
        response = await axios.post(`${url}/api/food/update/${selectedFood._id}`, formDataToSend);
      }

      if (response.data.success) {
        toast.success(response.data.message);
        setShowModal(false);
        fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi xử lý yêu cầu");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <div className="list-header">
        <p>Danh sách món ăn</p>
        <button className="add-btn" onClick={openAddModal}>
          Thêm món ăn mới
        </button>
      </div>
      
      <div className="list-table">
        <div className="list-table-format title">
          <b>Hình ảnh</b>
          <b>Tên</b>
          <b>Danh mục</b>
          <b>Giá</b>
          <b>Thao tác</b>
        </div>
        {list.map((item, index) => (
          <div key={index} className="list-table-format">
            <img src={`${url}/images/` + item.image} alt={item.name} />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>₫{item.price}</p>
            <div className="action-buttons">
              <button onClick={() => openEditModal(item._id)} className="edit-btn">
                Sửa
              </button>
              <button onClick={() => removeFood(item._id)} className="remove-btn">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm/Sửa Món Ăn */}
      {showModal && (
        <div className="food-modal-overlay">
          <div className="food-modal">
            <div className="food-modal-header">
              <h2>{modalType === "add" ? "Thêm món ăn mới" : "Cập nhật món ăn"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="food-form">
              <div className="form-group">
                <label>Hình ảnh</label>
                <div className="image-upload">
                  <label htmlFor="image-upload">
                    <img 
                      src={
                        image 
                          ? URL.createObjectURL(image) 
                          : (selectedFood && modalType === "edit") 
                            ? `${url}/images/${selectedFood.image}`
                            : assets.upload_area
                      } 
                      alt="Hình ảnh món ăn" 
                    />
                  </label>
                  <input 
                    type="file" 
                    id="image-upload" 
                    onChange={(e) => setImage(e.target.files[0])}
                    required={modalType === "add"}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tên món ăn</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea 
                  name="description" 
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Danh mục</label>
                  <select 
                    name="category" 
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="Salad">Salad</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Deserts">Deserts</option>
                    <option value="Sandwich">Sandwich</option>
                    <option value="Cake">Cake</option>
                    <option value="Pure Veg">Pure Veg</option>
                    <option value="Pasta">Pasta</option>
                    <option value="Noodles">Noodles</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Giá (VNĐ)</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

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

export default List;