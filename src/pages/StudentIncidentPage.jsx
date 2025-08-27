import React, { useState, useRef, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StudentIncidentPage.css";


export default function StudentIncidentPage() {
  const [students, setStudents] = useState([
    { name: "John Doe", id: "01", department: "BSIT", year: "III" },
    { name: "Jane Smith", id: "02", department: "BSED", year: "II" },
    { name: "Alice Brown", id: "03", department: "BSIT", year: "I" }
  ]);

  const [searchTerm, setSearchTerm] = useState(""); // Search input
  const [searchQuery, setSearchQuery] = useState(""); // Applied search filter

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // 🔹 NEW STATE
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [filterAZ, setFilterAZ] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const fileInputRef = useRef(null);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  // Close filter if clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddStudent = (e) => {
    e.preventDefault();
    const form = e.target;
    const newStudent = {
      name: form.name.value,
      email: form.email.value,
      id: form.id.value,
      department: form.department?.value || "",
      year: form.year?.value || "",
      grade: form.grade?.value || "",
      section: form.section?.value || "",
      strand: form.strand?.value || ""
    };
    setStudents([...students, newStudent]);
    setShowAddModal(false);
    setSelectedLevel("");
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File "${file.name}" uploaded! (Processing logic here)`);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Name", "ID", "Department", "Year"],
      ...students.map((s) => [s.name, s.id, s.department, s.year])
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
  };

  const handleDownloadTemplate = () => {
    const csv = "Name,ID,Department,Section,Grade,Strand,Year\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template.csv";
    a.click();
  };

  const goToIncidentPage = (student) => {
    // navigate to the Incident page and pass the selected student via location.state
    navigate("/incident", { state: { student } });
  };
  
  // 🔍 Handle search button click
  const handleSearch = () => {
    setSearchQuery(searchTerm.trim().toLowerCase());
  };

  const filteredStudents = useMemo(() => {
    let data = [...students];

    // Apply search filter
    if (searchQuery) {
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery) ||
          s.id.toLowerCase().includes(searchQuery) ||
          s.department.toLowerCase().includes(searchQuery) ||
          s.year.toLowerCase().includes(searchQuery)
      );
    }

    if (filterDepartment) {
      data = data.filter((s) => s.department === filterDepartment);
    }
    if (filterYear) {
      data = data.filter((s) => s.year === filterYear);
    }
    if (filterAZ === "asc") {
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filterAZ === "desc") {
      data.sort((a, b) => b.name.localeCompare(a.name));
    }
    return data;
  }, [students, filterAZ, filterDepartment, filterYear, searchQuery]);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header-bar">
        <h1 className="dashboard-title">Student Management</h1>
        <div className="user-account">
          <img src="/RCCLOGO.png" alt="Rcc Logo" className="account-logo" />
          <span className="account-name">OSA</span>
          <span className="dropdown-icon">▾</span>
        </div>
      </div>

      {/* Search + Buttons */}
      <div className="top-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btn" onClick={handleSearch}>
            Search
          </button>
        </div>
        <div className="top-buttons" ref={filterRef}>
          <button className="btn add" onClick={() => setShowAddModal(true)}>
            + Add
          </button>
          <button
            className="btn bulk"
            onClick={() => fileInputRef.current.click()}
          >
            Bulk Upload
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleBulkUpload}
          />
          <button className="btn export" onClick={handleExport}>
            Export
          </button>
          <button
            className="btn filter"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            Filter
          </button>
          {filterOpen && (
            <div className="filter-dropdown">
              <h3 className="filter-title">Filter</h3>
              {/* Alphabetical */}
              <div className="filter-section">
                <label className="filter-section-title">Alphabetical</label>
                <div className="filter-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={filterAZ === "asc"}
                      onChange={() =>
                        setFilterAZ(filterAZ === "asc" ? null : "asc")
                      }
                    />{" "}
                    Filter by A–Z
                  </label>
                </div>
                <div className="filter-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={filterAZ === "desc"}
                      onChange={() =>
                        setFilterAZ(filterAZ === "desc" ? null : "desc")
                      }
                    />{" "}
                    Filter by Z–A
                  </label>
                </div>
              </div>
              {/* Department */}
              <div className="filter-section">
                <label className="filter-section-title">Department</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="">All Departments</option>
                  <option value="BSIT">BSIT</option>
                  <option value="BSED">BSED</option>
                  <option value="BSBA">BSBA</option>
                </select>
              </div>
              {/* Year Level */}
              <div className="filter-section">
                <label className="filter-section-title">Year Level</label>
                <div className="year-radio-group">
                  {["I", "II", "III", "IV", ""].map((yr, i) => (
                    <label key={i}>
                      <input
                        type="radio"
                        name="year"
                        value={yr}
                        checked={filterYear === yr}
                        onChange={(e) => setFilterYear(e.target.value)}
                      />{" "}
                      {yr || "All"}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="student-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Department</th>
            <th>Section</th>
            <th>Grade</th>
            <th>Strand</th>
            <th>Year</th>
            <th>Action</th>
            <th>Incident</th>
          </tr>
        </thead>
        <tbody>
  {filteredStudents.map((s, idx) => (
    <tr key={idx}>
      <td>{s.name}</td>
      <td>{s.id}</td>
      <td>{s.department || "-"}</td>
      <td>{s.section || "-"}</td>
      <td>{s.grade || "-"}</td>
      <td>{s.strand || "-"}</td>
      <td>{s.year || "-"}</td>
      <td>
        <button
          className="btn view"
          onClick={() => {
            setSelectedStudent(s);
            setShowViewModal(true);
          }}
        >
          View
        </button>
      </td>
      <td>
        <button
          className="btn configure"
          onClick={() => goToIncidentPage(s)}
        >
          Configure
        </button>
      </td>
    </tr>
  ))}
</tbody>

      </table>

      {/* Download Template Button */}
      <div className="download-template">
        <button onClick={handleDownloadTemplate}>Download Template</button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Student</h3>
            <form onSubmit={handleAddStudent} className="add-student-form">
              <label>
                Name<span className="required">*</span>
              </label>
              <input name="name" required />

              <label>
                Email<span className="required">*</span>
              </label>
              <input name="email" type="email" required />

              {/* Radio Buttons */}
              <div className="radio-group-horizontal">
                {["junior", "senior", "college"].map((lvl) => (
                  <label key={lvl} className="radio-option">
                    <input
                      type="radio"
                      name="level"
                      value={lvl}
                      checked={selectedLevel === lvl}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      required
                    />
                    {lvl === "junior"
                      ? "Junior High School"
                      : lvl === "senior"
                      ? "Senior High School"
                      : "College"}
                  </label>
                ))}
              </div>

              {/* Conditional Fields */}
              {selectedLevel === "junior" && (
                <>
                  <label>
                    ID<span className="required">*</span>
                  </label>
                  <input name="id" required />

                  <label>
                    Grade<span className="required">*</span>
                  </label>
                  <select name="grade" required>
                    <option value="">Select Grade</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                  </select>

                  <label>
                    Section<span className="required">*</span>
                  </label>
                  <select name="section" required>
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>
                </>
              )}

              {selectedLevel === "senior" && (
                <>
                  <label>
                    ID<span className="required">*</span>
                  </label>
                  <input name="id" required />

                  <label>
                    Grade<span className="required">*</span>
                  </label>
                  <select name="grade" required>
                    <option value="">Select Grade</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>

                  <label>
                    Section<span className="required">*</span>
                  </label>
                  <select name="section" required>
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                  </select>

                  <label>
                    Strand<span className="required">*</span>
                  </label>
                  <input name="strand" required />
                </>
              )}

              {selectedLevel === "college" && (
                <>
                  <label>
                    ID<span className="required">*</span>
                  </label>
                  <input name="id" required />

                  <label>
                    Department<span className="required">*</span>
                  </label>
                  <select name="department" required>
                    <option value="">Select Department</option>
                    <option value="BSIT">BSIT</option>
                    <option value="BSED">BSED</option>
                  </select>

                  <label>
                    Year<span className="required">*</span>
                  </label>
                  <select name="year" required>
                    <option value="">Select Year</option>
                    <option value="I">I</option>
                    <option value="II">II</option>
                    <option value="III">III</option>
                    <option value="IV">IV</option>
                  </select>
                </>
              )}

              <div className="button-row">
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            {/* Header */}
            <h3>View Student</h3>

            {/* Student Details */}
            <div className="view-details">
              <p><b>Name</b> &nbsp;&nbsp; {selectedStudent.name}</p>
              <p><b>Student ID</b> &nbsp;&nbsp; {selectedStudent.id}</p>
              <p><b>Department</b> &nbsp;&nbsp; {selectedStudent.department}</p>
              <p><b>Year</b> &nbsp;&nbsp; {selectedStudent.year}</p>
              <p><b>Email</b> &nbsp;&nbsp; {selectedStudent.email || "N/A"}</p>
              <p><b>Status</b> &nbsp;&nbsp; {selectedStudent.status || "Active"}</p>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions bottom-right">
              <button
                className="btn close"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              <button
                className="btn edit"
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
              >
                Edit
              </button>
              <button className="btn delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedStudent && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Student</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target;
                const updatedStudent = {
                  ...selectedStudent,
                  name: form.name.value,
                  email: form.email.value,
                  id: form.id.value,
                  department: form.department.value,
                  year: form.year.value,
                  status: form.status.value,
                };

                setStudents((prev) =>
                  prev.map((s) => (s.id === selectedStudent.id ? updatedStudent : s))
                );
                setShowEditModal(false);
              }}
            >
              <label>
                Name<span className="required">*</span>
              </label>
              <input name="name" defaultValue={selectedStudent.name} required />

              <label>
                Email<span className="required">*</span>
              </label>
              <input
                name="email"
                type="email"
                defaultValue={selectedStudent.email || ""}
                required
              />

              <label>
                ID<span className="required">*</span>
              </label>
              <input name="id" defaultValue={selectedStudent.id} required />

              <label>
                Department<span className="required">*</span>
              </label>
              <select name="department" defaultValue={selectedStudent.department}>
                <option value="BSIT">BSIT</option>
                <option value="BSED">BSED</option>
                <option value="BSBA">BSBA</option>
              </select>

              <label>
                Year<span className="required">*</span>
              </label>
              <select name="year" defaultValue={selectedStudent.year}>
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
              </select>

              <label>Status</label>
              <input name="status" defaultValue={selectedStudent.status || "Active"} />

              <div className="button-row">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
