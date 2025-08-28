// src/pages/ViolationPage.jsx
import React, { useState, useRef, useEffect } from "react";
import "./ViolationPage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

const initialViolations = [
  { violation: "Late", type: "Minor", severity: "Moderate" },
  { violation: "No Uniform", type: "Minor", severity: "High" },
  { violation: "No ID", type: "Major", severity: "High" },
  { violation: "Disruptive Behavior", type: "Major", severity: "High" },
  { violation: "Smoking", type: "Major", severity: "High" },
  { violation: "Vandalism", type: "Major", severity: "High" },
];

export default function ViolationPage() {
  const [violations, setViolations] = useState(initialViolations);
  const [filteredViolations, setFilteredViolations] = useState(initialViolations);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ violation: "", type: "", severity: "" });
  const [editIndex, setEditIndex] = useState(null);

  // filter modal states
  const [alphabetical, setAlphabetical] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const filterRef = useRef(null);

  // ---- HANDLE INPUT ----
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---- ADD ----
  const handleAdd = () => {
    const updated = [...violations, formData];
    setViolations(updated);
    setFilteredViolations(updated);
    setFormData({ violation: "", type: "", severity: "" });
    setShowAddModal(false);
  };

  // ---- EDIT ----
  const handleEdit = () => {
    const updated = [...violations];
    updated[editIndex] = formData;
    setViolations(updated);
    setFilteredViolations(updated);
    setFormData({ violation: "", type: "", severity: "" });
    setShowEditModal(false);
  };

  const openEditModal = (index) => {
    setEditIndex(index);
    setFormData(violations[index]);
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this violation?")) {
      const updated = violations.filter((_, i) => i !== index);
      setViolations(updated);
      setFilteredViolations(updated);
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = violations.filter((v) =>
      v.violation.toLowerCase().includes(value)
    );
    setFilteredViolations(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...violations];

    if (alphabetical === "az") {
      result.sort((a, b) => a.violation.localeCompare(b.violation));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.violation.localeCompare(a.violation));
    }

    if (categoryFilter) {
      result = result.filter((v) => v.type === categoryFilter);
    }

    if (severityFilter) {
      result = result.filter((v) => v.severity === severityFilter);
    }

    setFilteredViolations(result);
    setShowFilterModal(false);
  };

  // ---- EXPORT ----
  const handleExport = () => {
    const csv = [
      ["Violation", "Category", "Severity"],
      ...violations.map((v) => [v.violation, v.type, v.severity]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "violations.csv";
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

      // Expecting format: Violation,Category,Severity
      const newViolations = rows.slice(1).map((row) => {
        const [violation, type, severity] = row.split(",");
        return {
          violation: violation?.trim(),
          type: type?.trim(),
          severity: severity?.trim(),
        };
      });

      const updated = [...violations, ...newViolations];
      setViolations(updated);
      setFilteredViolations(updated);
    };
    reader.readAsText(file);
  };

  // ---- DOWNLOAD TEMPLATE ----
  const handleDownloadTemplate = () => {
    const template = "Violation,Category,Severity\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "violation_template.csv";
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
    <div className="violation-container">
      {/* HEADER WITH USER */}
      <div className="violation-header">
        <h2>Violation Management</h2>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <span className="username">Admin User</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="violation-controls">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={handleSearch}
        />
        <div className="button-group">
          <button className="btn primary" onClick={() => setShowAddModal(true)}>+ Add</button>
          
          {/* Bulk Upload */}
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
      <div className="violation-table-container">
        <table className="violation-table">
          <thead>
            <tr>
              <th>Violation</th>
              <th>Type</th>
              <th>Severity Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredViolations.map((v, i) => (
              <tr key={i}>
                <td>{v.violation}</td>
                <td>{v.type}</td>
                <td>{v.severity}</td>
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
              <h3>Add Violation</h3>
            </div>
            <div className="modal-body">
              <label>Violation</label>
              <input
                type="text"
                name="violation"
                value={formData.violation}
                onChange={handleInputChange}
              />
              <label>Category</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="">Select Category</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
              </select>
              <label>Severity Level</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
              >
                <option value="">Select Severity</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn add" onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- EDIT MODAL ---- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h3>Edit Violation</h3>
            </div>
            <div className="modal-body">
              <label>Violation</label>
              <input
                type="text"
                name="violation"
                value={formData.violation}
                onChange={handleInputChange}
              />
              <label>Category</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
              </select>
              <label>Severity Level</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn add" onClick={handleEdit}>
                Save
              </button>
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
              /> Filter by A-Z
            </div>
            <div>
              <input
                type="checkbox"
                checked={alphabetical === "za"}
                onChange={() => setAlphabetical(alphabetical === "za" ? "" : "za")}
              /> Filter by Z-A
            </div>

            <label>Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
            </select>

            <label>Severity Level</label>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Low">Low</option>
              <option value="Moderate">Moderate</option>
              <option value="High">High</option>
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
