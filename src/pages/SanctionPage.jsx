// src/pages/SanctionPage.jsx
import React, { useState, useRef, useEffect } from "react";
import "./SanctionPage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

const initialSanctions = [
  { sanction: "Oral Warning", type: "Minor", offense: "1st", severity: "Low" },
  { sanction: "Written Warning", type: "Minor", offense: "2nd", severity: "Moderate" },
  { sanction: "Suspension", type: "Major", offense: "3rd", severity: "High" },
  { sanction: "Exclusion", type: "Major", offense: "3rd", severity: "High" },
  { sanction: "Expulsion", type: "Major", offense: "3rd", severity: "High" },
];

export default function SanctionPage() {
  const [sanctions, setSanctions] = useState(initialSanctions);
  const [filteredSanctions, setFilteredSanctions] = useState(initialSanctions);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ sanction: "", type: "", offense: "", severity: "" });
  const [editIndex, setEditIndex] = useState(null);

  // filter modal states
  const [alphabetical, setAlphabetical] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [offenseFilter, setOffenseFilter] = useState("");

  const filterRef = useRef(null);

  // ---- HANDLE INPUT ----
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---- ADD ----
  const handleAdd = () => {
    const updated = [...sanctions, formData];
    setSanctions(updated);
    setFilteredSanctions(updated);
    setFormData({ sanction: "", type: "", offense: "", severity: "" });
    setShowAddModal(false);
  };

  // ---- EDIT ----
  const handleEdit = () => {
    const updated = [...sanctions];
    updated[editIndex] = formData;
    setSanctions(updated);
    setFilteredSanctions(updated);
    setFormData({ sanction: "", type: "", offense: "", severity: "" });
    setShowEditModal(false);
  };

  const openEditModal = (index) => {
    setEditIndex(index);
    setFormData(sanctions[index]);
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this sanction?")) {
      const updated = sanctions.filter((_, i) => i !== index);
      setSanctions(updated);
      setFilteredSanctions(updated);
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = sanctions.filter((s) =>
      s.sanction.toLowerCase().includes(value)
    );
    setFilteredSanctions(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...sanctions];

    if (alphabetical === "az") {
      result.sort((a, b) => a.sanction.localeCompare(b.sanction));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.sanction.localeCompare(a.sanction));
    }

    if (categoryFilter) {
      result = result.filter((s) => s.type === categoryFilter);
    }

    if (severityFilter) {
      result = result.filter((s) => s.severity === severityFilter);
    }

    if (offenseFilter) {
      result = result.filter((s) => s.offense === offenseFilter);
    }

    setFilteredSanctions(result);
    setShowFilterModal(false);
  };

  // ---- EXPORT ----
  const handleExport = () => {
    const csv = [
      ["Sanction", "Category", "Offense Level", "Severity"],
      ...sanctions.map((s) => [s.sanction, s.type, s.offense, s.severity]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sanctions.csv";
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

      // Expecting format: Sanction,Category,Offense Level,Severity
      const newSanctions = rows.slice(1).map((row) => {
        const [sanction, type, offense, severity] = row.split(",");
        return {
          sanction: sanction?.trim(),
          type: type?.trim(),
          offense: offense?.trim(),
          severity: severity?.trim(),
        };
      });

      const updated = [...sanctions, ...newSanctions];
      setSanctions(updated);
      setFilteredSanctions(updated);
    };
    reader.readAsText(file);
  };

  // ---- DOWNLOAD TEMPLATE ----
  const handleDownloadTemplate = () => {
    const template = "Sanction,Category,Offense Level,Severity\nExample,Minor,1st,Low";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sanction_template.csv";
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
    <div className="sanction-container">
      {/* HEADER WITH USER */}
      <div className="sanction-header">
        <h2>Sanction Management</h2>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <span className="username">Admin User</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="sanction-controls">
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={search}
          onChange={handleSearch}
        />
        <div className="button-group">
          <button className="btn primary" onClick={() => setShowAddModal(true)}>+ Add</button>

          {/* Bulk Upload with hidden input */}
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
      <div className="sanction-table-container">
        <table className="sanction-table">
          <thead>
            <tr>
              <th>Sanction</th>
              <th>Type</th>
              <th>Offense Level</th>
              <th>Severity Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSanctions.map((s, i) => (
              <tr key={i}>
                <td>{s.sanction}</td>
                <td>{s.type}</td>
                <td>{s.offense}</td>
                <td>{s.severity}</td>
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
          <div className="custom-modal">
            <div className="modal-header">Add Sanction</div>
            <div className="modal-body">
              <label>Sanction</label>
              <input
                type="text"
                name="sanction"
                value={formData.sanction}
                onChange={handleInputChange}
              />
              <label>Category</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="">Select Category</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
              </select>
              <label>Offense Level</label>
              <select name="offense" value={formData.offense} onChange={handleInputChange}>
                <option value="">Select Offense</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
              </select>
              <label>Severity Level</label>
              <select name="severity" value={formData.severity} onChange={handleInputChange}>
                <option value="">Select Severity</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn confirm" onClick={handleAdd}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* ---- EDIT MODAL ---- */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">Edit Sanction</div>
            <div className="modal-body">
              <label>Sanction</label>
              <input
                type="text"
                name="sanction"
                value={formData.sanction}
                onChange={handleInputChange}
              />
              <label>Category</label>
              <select name="type" value={formData.type} onChange={handleInputChange}>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
              </select>
              <label>Offense Level</label>
              <select name="offense" value={formData.offense} onChange={handleInputChange}>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
              </select>
              <label>Severity Level</label>
              <select name="severity" value={formData.severity} onChange={handleInputChange}>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn confirm" onClick={handleEdit}>Save</button>
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
              /> A-Z
            </div>
            <div>
              <input
                type="checkbox"
                checked={alphabetical === "za"}
                onChange={() => setAlphabetical(alphabetical === "za" ? "" : "za")}
              /> Z-A
            </div>

            <label>Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All</option>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
            </select>

            <label>Offense Level</label>
            <select value={offenseFilter} onChange={(e) => setOffenseFilter(e.target.value)}>
              <option value="">All</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">3rd</option>
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
