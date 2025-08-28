// src/pages/StrandPage.jsx
import React, { useState, useRef, useEffect } from "react";
import "./StrandPage.css";
import { FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";

const initialStrands = [];

export default function StrandPage() {
  const [strands, setStrands] = useState(initialStrands);
  const [filteredStrands, setFilteredStrands] = useState(initialStrands);
  const [search, setSearch] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [formData, setFormData] = useState({ id: "", strand_name: "", type: "" });
  const [editIndex, setEditIndex] = useState(null);

  // filter states
  const [alphabetical, setAlphabetical] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filterRef = useRef(null);

  // ---- FETCH FROM BACKEND ----
  useEffect(() => {
    fetch("http://localhost/SDSUpdatededs-main/backend/strand.php")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStrands(data);
          setFilteredStrands(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching strands:", err);
      });
  }, []);

  // ---- INPUT HANDLER ----
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---- ADD ----
  const handleAdd = () => {
    fetch("http://localhost/SDSUpdatededs-main/backend/strand.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, action: "add" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const newStrand = { id: data.id, strand_name: formData.strand_name, type: formData.type };
          const updated = [...strands, newStrand];
          setStrands(updated);
          setFilteredStrands(updated);
          setFormData({ id: "", strand_name: "", type: "" });
          setShowAddModal(false);
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => console.error("Error saving strand:", err));
  };

  // ---- EDIT ----
  const handleEdit = () => {
    fetch("http://localhost/SDSUpdatededs-main/backend/strand.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, action: "update" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const updated = [...strands];
          updated[editIndex] = formData;
          setStrands(updated);
          setFilteredStrands(updated);
          setFormData({ id: "", strand_name: "", type: "" });
          setShowEditModal(false);
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch((err) => console.error("Error updating strand:", err));
  };

  const openEditModal = (index) => {
    setEditIndex(index);
    setFormData(strands[index]);
    setShowEditModal(true);
  };

  // ---- DELETE ----
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this strand?")) {
      const deletedStrand = strands[index];

      fetch("http://localhost/SDSUpdatededs-main/backend/strand.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletedStrand.id, action: "delete" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const updated = strands.filter((_, i) => i !== index);
            setStrands(updated);
            setFilteredStrands(updated);
          } else {
            alert("Error: " + data.message);
          }
        })
        .catch((err) => console.error("Error deleting strand:", err));
    }
  };

  // ---- SEARCH ----
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = strands.filter((s) =>
      s.strand_name.toLowerCase().includes(value)
    );
    setFilteredStrands(filtered);
  };

  // ---- FILTER ----
  const applyFilter = () => {
    let result = [...strands];

    if (alphabetical === "az") {
      result.sort((a, b) => a.strand_name.localeCompare(b.strand_name));
    } else if (alphabetical === "za") {
      result.sort((a, b) => b.strand_name.localeCompare(a.strand_name));
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
      ...strands.map((s) => [s.strand_name, s.type]),
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

      const newStrands = rows.slice(1).map((row) => {
        const [strand_name, type] = row.split(",");
        return { strand_name: strand_name?.trim(), type: type?.trim() };
      });

      // Bulk insert one by one
      Promise.all(
        newStrands.map((strand) =>
          fetch("http://localhost/SDSUpdatededs-main/backend/strand.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...strand, action: "add" }),
          }).then((res) => res.json())
        )
      )
        .then((results) => {
          const successful = results.filter((r) => r.success);
          if (successful.length > 0) {
            const updated = [...strands, ...newStrands];
            setStrands(updated);
            setFilteredStrands(updated);
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
                <td>{s.strand_name}</td>
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
                name="strand_name"
                value={formData.strand_name}
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
                name="strand_name"
                value={formData.strand_name}
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
