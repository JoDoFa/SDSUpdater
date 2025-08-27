// src/pages/GradePage.jsx
import React, { useState, useRef, useEffect } from "react";
import "./GradePage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

const initialGrades = [
  { grade: "Grade 7", type: "Student" },
  { grade: "Grade 8", type: "Student" },
  { grade: "Grade 9", type: "Student" },
  { grade: "Grade 10", type: "Student" },
  { grade: "Grade 11", type: "Student" },
  { grade: "Grade 12", type: "Student" },
];

export default function GradePage() {
  const [grades, setGrades] = useState(initialGrades);
  const [filteredGrades, setFilteredGrades] = useState(initialGrades);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ grade: "", type: "" });
  const [editIndex, setEditIndex] = useState(null);

  // filter modal states
  const [alphabetical, setAlphabetical] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filterRef = useRef(null);

  // ---- HANDLE INPUT ----
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---- ADD ----
  const handleAdd = () => {
    const updated = [...grades, formData];
    setGrades(updated);
    setFilteredGrades(updated);
    setFormData({ grade: "", type: "" });
    setShowAddModal(false);
  };

  // ---- EDIT ----
  const handleEdit = () => {
    const updated = [...grades];
    updated[editIndex] = formData;
    setGrades(updated);
    setFilteredGrades(updated);
    setFormData({ grade: "", type: "" });
    setShowEditModal(false);
  };

  const openEditModal = (index) => {
    setEditIndex(index);
    setFormData(grades[index]);
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      const updated = grades.filter((_, i) => i !== index);
      setGrades(updated);
      setFilteredGrades(updated);
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = grades.filter((g) =>
      g.grade.toLowerCase().includes(value)
    );
    setFilteredGrades(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...grades];

    if (alphabetical === "az") {
      result.sort((a, b) => a.grade.localeCompare(b.grade));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.grade.localeCompare(a.grade));
    }

    if (typeFilter) {
      result = result.filter((g) => g.type === typeFilter);
    }

    setFilteredGrades(result);
    setShowFilterModal(false);
  };

  // ---- EXPORT ----
  const handleExport = () => {
    const csv = [
      ["Grade", "Type"],
      ...grades.map((g) => [g.grade, g.type]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grades.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- BULK UPLOAD (Simulation) ----
  const handleBulkUpload = () => {
    alert("Bulk Upload feature not yet implemented.");
  };

  // ---- DOWNLOAD TEMPLATE ----
  const handleDownloadTemplate = () => {
    const template = "Grade,Type\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grade_template.csv";
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
    <div className="grade-container">
      {/* HEADER WITH USER */}
      <div className="grade-header">
        <h2>Grade Management</h2>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <span className="username">Admin User</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grade-controls">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={handleSearch}
        />
        <div className="button-group">
          <button className="btn primary" onClick={() => setShowAddModal(true)}>+ Add</button>
          <button className="btn secondary" onClick={handleBulkUpload}>Bulk Upload</button>
          <button className="btn secondary" onClick={handleExport}>Export</button>
          <button className="btn secondary" onClick={() => setShowFilterModal(true)}>Filter</button>
        </div>
      </div>

      {/* TABLE */}
      <div className="grade-table-container">
        <table className="grade-table">
          <thead>
            <tr>
              <th>Grade</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGrades.map((g, i) => (
              <tr key={i}>
                <td>{g.grade}</td>
                <td>{g.type}</td>
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
              <h3>Add Grade</h3>
            </div>
            <div className="modal-body">
              <label>Grade</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                placeholder="Enter Grade"
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
              <h3>Edit Grade</h3>
            </div>
            <div className="modal-body">
              <label>Grade</label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                placeholder="Enter Grade"
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
