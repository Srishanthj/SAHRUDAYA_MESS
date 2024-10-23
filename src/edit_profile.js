import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase_config";
import { uploadDP } from "./authFunctions";
import { QRCodeCanvas } from "qrcode.react";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from './sidebar';
import { useNavigate } from "react-router-dom";
import { FaEdit, FaSave } from "react-icons/fa";
import "./edit_profile.css";
import ProfileNavbar from "./profile_nav";

const EditProfilePage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    setValue,
  } = useForm();
  const [selectedDp, setSelectedDp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const qrCodeRef = useRef();
  const storage = getStorage();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, [navigate]);
  

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = auth.currentUser.uid;
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          setUserDetails(userDoc.data());
          setValue("name", userDoc.data().name);
          setValue("messNo", userDoc.data().messNo);
          setValue("phone", userDoc.data().phone);
          setValue("department",userDoc.data().department);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data.");
      }
    };

    fetchUserData();
  }, [setValue]);

  const showToast = (message, type) => {
    type === "success" ? toast.success(message) : toast.error(message);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const userId = auth.currentUser.uid;
      let dpUrl = userDetails.dpUrl;

      if (selectedDp) {
        dpUrl = await uploadDP(data.name, selectedDp);
      }

      const updatedData = {};
      if (editingField === "name") {
        updatedData.name = data.name;
      } else if (editingField === "messNo") {
        updatedData.messNo = data.messNo;
      } else if (editingField === "dpUrl") {
        updatedData.dpUrl = dpUrl;
      } else if (editingField === "phone") {
        updatedData.phone = data.phone;
      }
      else if(editingField == "department"){
        updatedData.department = data.department;
      }

      await updateDoc(doc(db, "users", userId), updatedData);

      showToast("Profile updated successfully!", "success");
      reset();
      navigate("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("Failed to update profile.", "error");
    } finally {
      setIsLoading(false);
      setEditingField(null);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectProfilePicture = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const MAX_WIDTH = 200;
          const MAX_HEIGHT = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          setSelectedDp(canvas.toDataURL("image/jpeg"));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
   <div>
    <ProfileNavbar 
        title="Edit Profile" 
        onToggleSidebar={toggleSidebar} 
        isSidebarOpen={isSidebarOpen} 
      />

<div className="header-container">
        {isSidebarOpen && (
          <button className="sidebar-toggle" onClick={toggleSidebar}>
          </button>
        )}
      </div> 

      {isSidebarOpen && (
        <div ref={sidebarRef} className="sidebar-container">
          <Sidebar uid={userData?.uid} name={userData?.name} isAdmin={userData?.isAdmin} />
        </div>
      )}

     <div className="edit-profile-page">
      {isLoading && <div className="loading-dialog">Updating profile...</div>}

      <div className="profile-field">
        <label>Profile Picture:</label>
        {selectedDp ? (
          <img src={selectedDp} alt="Profile" className="avatar" />
        ) : (
          <img src={userDetails.dpUrl} alt="Profile" className="avatar" />
        )}
        {editingField === "dpUrl" ? (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={selectProfilePicture}
              className="file-input"
            />
            <button onClick={handleSubmit(onSubmit)}>Save</button>
          </>
        ) : (
          <button onClick={() => setEditingField("dpUrl")}>
            <FaEdit /> Edit
          </button>
        )}
      </div>

      <div className="profile-field">
        <label>Name:</label>
        {editingField === "name" ? (
          <>
            <input
              {...register("name", { required: "Please enter your name" })}
              placeholder="Name"
              className="input-field"
            />
            {errors.name && (
              <span className="error">{errors.name.message}</span>
            )}
            <button onClick={handleSubmit(onSubmit)}>
              <FaSave /> Save
            </button>
          </>
        ) : (
          <>
            <span>{userDetails.name}</span>
            <button onClick={() => setEditingField("name")}>
              <FaEdit /> Edit
            </button>
          </>
        )}
      </div>

      <div className="profile-field">
        <label>Mess No:</label>
        {editingField === "messNo" ? (
          <>
            <input
              {...register("messNo", { required: "Please enter your mess no" })}
              placeholder="Mess No"
              className="input-field"
            />
            {errors.messNo && (
              <span className="error">{errors.messNo.message}</span>
            )}
            <button onClick={handleSubmit(onSubmit)}>
              <FaSave /> Save
            </button>
          </>
        ) : (
          <>
            <span>{userDetails.messNo}</span>
            <button onClick={() => setEditingField("messNo")}>
              <FaEdit /> Edit
            </button>
          </>
        )}
      </div>

      <div className="profile-field">
        <label>Department:</label>
        {editingField === "department" ? (
          <>
            <input
              {...register("department", { required: "Please enter your department" })}
              placeholder="Department"
              className="input-field"
            />
            {errors.name && (
              <span className="error">{errors.department.message}</span>
            )}
            <button onClick={handleSubmit(onSubmit)}>
              <FaSave /> Save
            </button>
          </>
        ) : (
          <>
            <span>{userDetails.department}</span>
            <button onClick={() => setEditingField("department")}>
              <FaEdit /> Edit
            </button>
          </>
        )}
      </div>

      <div className="profile-field">
        <label>Phone:</label>
        {editingField === "phone" ? (
          <>
            <input
              {...register("phone", {
                required: "Please enter your phone number",
              })}
              placeholder="Phone"
              className="input-field"
            />
            {errors.phone && (
              <span className="error">{errors.phone.message}</span>
            )}
            <button onClick={handleSubmit(onSubmit)}>
              <FaSave /> Save
            </button>
          </>
        ) : (
          <>
            <span>{userDetails.phone}</span>
            <button onClick={() => setEditingField("phone")}>
              <FaEdit /> Edit
            </button>
          </>
        )}
      </div>

      <div className="non-editable-field">
        <label>Email:</label>
        <input
          type="email"
          value={userDetails.email}
          disabled
          className="input-field"
        />
      </div>

      <div className="non-editable-field">
        <label>Role:</label>
        <input
          type="text"
          value={userDetails.role}
          disabled
          className="input-field"
        />
      </div>
    </div>
   </div>
  );
};

export default EditProfilePage;
