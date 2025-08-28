import React, { useState, useRef, useEffect } from "react";
import "./StrandPage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

const initialStrands = [
  { strand: "STEM", type: "Academic" },
  { strand: "ABM", type: "Academic" },
  { strand: "HUMSS", type: "Academic" },
  { strand: "GAS", type: "Academic" },
];

export default function StrandPage() {
  const [strands, setStrands] = useState(initialStrands);
  const [filteredStrands, setFilteredStrands] = useState(initialStrands);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ strand: "", type: "" });
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
    const updated = [...strands, formData];
    setStrands(updated);
    setFilteredStrands(updated);
    setFormData({ strand: "", type: "" });
    setShowAddModal(false);
  };

  // ---- EDIT ----
  const handleEdit = () => {
    const updated = [...strands];
    updated[editIndex] = formData;
    setStrands(updated);
    setFilteredStrands(updated);
    setFormData({ strand: "", type: "" });
    setShowEditModal(false);
  };

  const openEditModal = (index) => {
    setEditIndex(index);
    setFormData(strands[index]);
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this strand?")) {
      const updated = strands.filter((_, i) => i !== index);
      setStrands(updated);
      setFilteredStrands(updated);
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = strands.filter((s) =>
      s.strand.toLowerCase().includes(value)
    );
    setFilteredStrands(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...strands];

    if (alphabetical === "az") {
      result.sort((a, b) => a.strand.localeCompare(b.strand));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.strand.localeCompare(a.strand));
    }

    if (typeFilter) {
      result = result.filter((s) => s.type === typeFilter);
    }

    setFilteredStrands(result);
    setShowFilterModal(false);
  };

  // ---- EXPORT ----
  const handleExport = () => {
    const csv = [
      ["Strand", "Type"],
      ...strands.map((s) => [s.strand, s.type]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "strands.csv";
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

      // Expecting format: Strand,Type
      const newStrands = rows.slice(1).map((row) => {
        const [strand, type] = row.split(",");
        return {
          strand: strand?.trim(),
          type: type?.trim(),
        };
      });

      const updated = [...strands, ...newStrands];
      setStrands(updated);
      setFilteredStrands(updated);
    };
    reader.readAsText(file);
  };

  // ---- DOWNLOAD TEMPLATE ----
  const handleDownloadTemplate = () => {
    const template = "Strand,Type\n";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "strand_template.csv";
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
    <div className="strand-container">
      {/* HEADER WITH USER */}
      <div className="strand-header">
        <h2>Strand Management</h2>
        <div className="user-info">
          <FaUserCircle className="user-icon" />
          <span className="username">Admin User</span>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="strand-controls">
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
      <div className="strand-table-container">
        <table className="strand-table">
          <thead>
            <tr>
              <th>Strand</th>
              <th>Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredStrands.map((s, i) => (
              <tr key={i}>
                <td>{s.strand}</td>
                <td>{s.type}</td>
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
              <h3>Add Strand</h3>
            </div>
            <div className="modal-body">
              <label>Strand</label>
              <input
                type="text"
                name="strand"
                value={formData.strand}
                onChange={handleInputChange}
                placeholder="Enter Strand"
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
              <h3>Edit Strand</h3>
            </div>
            <div className="modal-body">
              <label>Strand</label>
              <input
                type="text"
                name="strand"
                value={formData.strand}
                onChange={handleInputChange}
                placeholder="Enter Strand"
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
              <option value="Academic">Academic</option>
              <option value="Technical-Vocational">Technical-Vocational</option>
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
