// src/pages/DepartmentPage.jsx
import React, { useState, useRef, useEffect } from "react";
import "./DepartmentPage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

const initialDepartments = [];

export default function DepartmentPage() {
  const [departments, setDepartments] = useState(initialDepartments);
  const [filteredDepartments, setFilteredDepartments] = useState(initialDepartments);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ id: "", name: "", type: "" });
  const [editIndex, setEditIndex] = useState(null);

  // filter states
  const [alphabetical, setAlphabetical] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filterRef = useRef(null);

  // ---- FETCH FROM BACKEND ----
  useEffect(() => {
    fetch("http://localhost/SDSUpdatededs-main/backend/department.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDepartments(data);
          setFilteredDepartments(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
      });
  }, []);

  // ---- INPUT HANDLER ----
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---- ADD ----
  const handleAdd = () => {
    fetch("http://localhost/SDSUpdatededs-main/backend/department.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, action: "add" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const newDept = { id: data.id, name: formData.name, type: formData.type };
          const updated = [...departments, newDept];
          setDepartments(updated);
          setFilteredDepartments(updated);
          setFormData({ id: "", name: "", type: "" });
          setShowAddModal(false);
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => console.error("Error saving department:", err));
  };

  // ---- EDIT ----
  const handleEdit = () => {
    fetch("http://localhost/SDSUpdatededs-main/backend/department.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, action: "update" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const updated = [...departments];
          updated[editIndex] = formData;
          setDepartments(updated);
          setFilteredDepartments(updated);
          setFormData({ id: "", name: "", type: "" });
          setShowEditModal(false);
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => console.error("Error updating department:", err));
  };

  const openEditModal = (index) => {
    setEditIndex(index);
    setFormData(departments[index]);
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      const deletedDept = departments[index];

      fetch("http://localhost/SDSUpdatededs-main/backend/department.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletedDept.id, action: "delete" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const updated = departments.filter((_, i) => i !== index);
            setDepartments(updated);
            setFilteredDepartments(updated);
          } else {
            alert("Error: " + data.message);
          }
        })
        .catch((err) => console.error("Error deleting department:", err));
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = departments.filter((d) =>
      d.name.toLowerCase().includes(value)
    );
    setFilteredDepartments(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...departments];

    if (alphabetical === "az") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (typeFilter) {
      result = result.filter((d) => d.type === typeFilter);
    }

    setFilteredDepartments(result);
    setShowFilterModal(false);
  };

  // ---- EXPORT ----
  const handleExport = () => {
    const csv = [
      ["Department", "Type"],
      ...departments.map((d) => [d.name, d.type]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "departments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- BULK UPLOAD ----
  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").map((row) => row.trim()).filter(Boolean);

      const newDepts = rows.slice(1).map((row) => {
        const [name, type] = row.split(",");
        return { name: name?.trim(), type: type?.trim() };
      });

      // Bulk insert one by one
      Promise.all(
        newDepts.map((dept) =>
          fetch("http://localhost/SDSUpdatededs-main/backend/department.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...dept, action: "add" }),
          }).then((res) => res.json())
        )
      )
        .then((results) => {
          const successful = results.filter((r) => r.success);
          if (successful.length > 0) {
            const updated = [...departments, ...newDepts];
            setDepartments(updated);
            setFilteredDepartments(updated);
          } else {
            alert("Error: Failed bulk upload");
          }
        })
        .catch((err) => console.error("Error bulk uploading:", err));
    };
    reader.readAsText(file);
  };

  // ---- DOWNLOAD TEMPLATE ----
  const handleDownloadTemplate = () => {
    const template = "Department,Type\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "department_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- CLOSE FILTER ON OUTSIDE CLICK ----
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterModal(false);
      }
    };

    if (showFilterModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showFilterModal]);

  return (
    <div className="department-container">
      {/* HEADER WITH USER */}
      <div className="department-header">
        <h2>Department Management</h2>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <span className="username">Admin User</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="department-controls">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={handleSearch}
        />
        <div className="button-group">
          <button className="btn primary" onClick={() => setShowAddModal(true)}>+ Add</button>
          
          <label className="btn secondary">
            Bulk Upload
            <input
              type="file"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleBulkUpload}
            />
          </label>

          <button className="btn secondary" onClick={handleExport}>Export</button>
          <button className="btn secondary" onClick={() => setShowFilterModal(true)}>Filter</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="department-table-container">
        <table className="department-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((d, i) => (
              <tr key={i}>
                <td>{d.name}</td>
                <td>{d.type}</td>
                <td>
                  <FaEdit className="icon edit-icon" onClick={() => openEditModal(i)} />
                  <FaTrash className="icon delete-icon" onClick={() => handleDelete(i)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="download-template">
        <button className="btn download" onClick={handleDownloadTemplate}>
          Download Template
        </button>
      </div>

      {/* ---- ADD MODAL ---- */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Add Department</h3>
            </div>
            <div className="modal-body">
              <label>Department</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Department"
              />
              <label>Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="Enter Type"
              />
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn add" onClick={handleAdd}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- EDIT MODAL ---- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Edit Department</h3>
            </div>
            <div className="modal-body">
              <label>Department</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Department"
              />
              <label>Type</label>
              <input
                type="text"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                placeholder="Enter Type"
              />
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn add" onClick={handleEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- FILTER MODAL ---- */}
      {showFilterModal && (
        <div className="filter-dropdown" ref={filterRef}>
          <div className="filter-modal">
            <h3>Filter</h3>
            <label>Alphabetical</label>
            <div>
              <input
                type="checkbox"
                checked={alphabetical === "az"}
                onChange={() => setAlphabetical(alphabetical === "az" ? "" : "az")}
              /> Sort A-Z
            </div>
            <div>
              <input
                type="checkbox"
                checked={alphabetical === "za"}
                onChange={() => setAlphabetical(alphabetical === "za" ? "" : "za")}
              /> Sort Z-A
            </div>

            <label>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
            </select>

            <div className="modal-actions">
              <button className="btn secondary" onClick={() => setShowFilterModal(false)}>Cancel</button>
              <button className="btn primary" onClick={applyFilter}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
