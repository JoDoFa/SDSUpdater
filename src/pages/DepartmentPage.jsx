import React, { useState } from "react";
import "./DepartmentPage.css";
import { FaEdit, FaTrash } from "react-icons/fa";


const DepartmentPage = () => {
  const [departments, setDepartments] = useState([
    { id: 1, name: "BSIT", type: "Student" },
    { id: 2, name: "BSEd", type: "Student" },
    { id: 3, name: "BEED", type: "Student" },
    { id: 4, name: "ABEL", type: "Student" },
    { id: 5, name: "ACT", type: "Student" },
    { id: 6, name: "BSHM", type: "Student" },
    { id: 7, name: "BSTM", type: "Student" },
    { id: 8, name: "BSA", type: "Student" },
    { id: 9, name: "BSMA", type: "Student" },
    { id: 10, name: "BSCE", type: "Student" },
    { id: 11, name: "OSA", type: "Admin" },
  ]);


  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", type: "Student" });
  const [editingDeptId, setEditingDeptId] = useState(null);


  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );


  const handleAdd = () => {
    if (!newDept.name) return alert("Please enter department name");
    setDepartments([
      ...departments,
      { id: Date.now(), name: newDept.name, type: newDept.type },
    ]);
    setNewDept({ name: "", type: "Student" });
    setShowModal(false);
  };


  const handleEdit = (id) => {
    if (!newDept.name) return alert("Please enter department name");
    setDepartments(
      departments.map((d) =>
        d.id === id ? { ...d, name: newDept.name, type: newDept.type } : d
      )
    );
    setNewDept({ name: "", type: "Student" });
    setEditingDeptId(null);
    setShowModal(false);
  };


  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      setDepartments(departments.filter((d) => d.id !== id));
    }
  };


  const handleBulkUpload = () => {
    alert("Bulk Upload functionality can be implemented here");
  };


  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Department Name,Department Type"]
        .concat(departments.map((d) => `${d.name},${d.type}`))
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "departments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Department Name,Department Type";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "department_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="department-container">
      {/* Header */}
      <div className="department-header">
        <h2>Department Management</h2>
        <div className="department-controls">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn primary" onClick={() => setShowModal(true)}>
            + Add
          </button>
          <button className="btn secondary" onClick={handleBulkUpload}>
            Bulk Upload
          </button>
          <button className="btn secondary" onClick={handleExport}>
            Export
          </button>
        </div>
      </div>


      {/* Table */}
      <div className="department-table-container">
        <table className="department-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Department Type</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept) => (
              <tr key={dept.id}>
                <td>{dept.name}</td>
                <td>{dept.type}</td>
                <td>
                  <FaEdit
                    className="icon edit-icon"
                    onClick={() => {
                      setNewDept({ name: dept.name, type: dept.type });
                      setEditingDeptId(dept.id);
                      setShowModal(true);
                    }}
                  />
                  <FaTrash
                    className="icon delete-icon"
                    onClick={() => handleDelete(dept.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Download Template */}
      <div className="download-template">
        <button className="btn download" onClick={handleDownloadTemplate}>
          Download Template
        </button>
      </div>


      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingDeptId ? "Edit Department" : "Add Department"}</h3>
            <label>Department Name</label>
            <input
              type="text"
              value={newDept.name}
              onChange={(e) =>
                setNewDept({ ...newDept, name: e.target.value })
              }
            />
            <label>Department Type</label>
            <select
              value={newDept.type}
              onChange={(e) =>
                setNewDept({ ...newDept, type: e.target.value })
              }
            >
              <option value="Student">Student</option>
              <option value="Admin">Admin</option>
            </select>


            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button
                onClick={() =>
                  editingDeptId ? handleEdit(editingDeptId) : handleAdd()
                }
              >
                {editingDeptId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default DepartmentPage;
