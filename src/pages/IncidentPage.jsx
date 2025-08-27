import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./IncidentPage.css";

function IncidentPage() {
  // Sample Students
  const [students] = useState([
    { id: "01", name: "John Doe", dept: "BSIT", year: "III", section: "" },
    { id: "02", name: "Jane Smith", dept: "BSED", year: "II", section: "A" },
  ]);

  const location = useLocation();

  // State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [violations, setViolations] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    sanction: "",
    violation: "",
    offense: "1st",
  });

  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [modal, setModal] = useState({ open: false, title: "", content: null });

  // ===========================
  // ADD: Major Offense Workflow
  // ===========================
  // Tracks the last SAVED step number per student (0..5). 0 means not started.
  const [majorSteps, setMajorSteps] = useState({});
  // Optional: store per-step data per student
  // shape: { [studentId]: { step1: {...}, step2: {...}, ... } }
  const [majorData, setMajorData] = useState({});

  // Helper: Open Major modal for a specific step
  const openMajorModal = (student, stepToOpen) => {
    if (!student) {
      alert("Select a student first!");
      return;
    }
    setModal({
      open: true,
      title: "Major Offense",
      content: (
        <MajorOffenseModal
          step={stepToOpen}
          student={student}
          savedData={(majorData[student.id] || {})[`step${stepToOpen}`]}
          onSave={(stepNumber, dataObj) => {
            // Save data for that step
            setMajorData((prev) => {
              const prevForStudent = prev[student.id] || {};
              return {
                ...prev,
                [student.id]: {
                  ...prevForStudent,
                  [`step${stepNumber}`]: dataObj,
                },
              };
            });
            // Mark this step as the latest saved step (does not auto-advance)
            setMajorSteps((prev) => ({
              ...prev,
              [student.id]: Math.max(prev[student.id] || 0, stepNumber),
            }));
            setModal({ open: false, title: "", content: null });
          }}
          onClose={() => setModal({ open: false, title: "", content: null })}
        />
      ),
    });
  };
  // ===========================
  // END ADD
  // ===========================

  // If navigated with a student in location.state, set it as selected
  useEffect(() => {
    if (location?.state?.student) {
      setSelectedStudent(location.state.student);
    }
  }, [location]);

  // Bulk Upload
  const handleBulkUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      alert(`File "${file.name}" uploaded! (Processing logic here)`);
    }
  };

  // Export Table Data
  const handleExport = () => {
    const headers = ["ID", "Name", "Department", "Year", "Section", "Violation"];
    const rows = violations.map((v) => [
      v.id,
      v.name,
      v.department,
      v.year,
      v.section,
      v.violation,
    ]);
    const tableData = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([tableData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "incident_records.csv";
    a.click();
  };

  // Download Template
  const handleDownloadTemplate = () => {
    const csv = "ID,Name,Dept.,Year,Section,Violation\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "incident_template.csv";
    a.click();
  };

  // Configure student
  const handleConfigure = (student) => {
    setSelectedStudent(student);
  };

  // Form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // ===========================
    // ADD: Open Major modal on select
    // ===========================
    if (name === "type" && value === "Major") {
      if (!selectedStudent) {
        alert("Select a student first before choosing 'Major'.");
        return;
      }
      // If first time, ensure step tracker is initialized to 0 (no steps saved yet)
      setMajorSteps((prev) => ({ ...prev, [selectedStudent.id]: prev[selectedStudent.id] || 0 }));
      // Always open Step 1 when selecting Major from the dropdown
      openMajorModal(selectedStudent, 1);
    }
    // ===========================
    // END ADD
    // ===========================
  };

  // Add violation
  const handleAddViolation = () => {
    if (!selectedStudent) {
      alert("Select a student first!");
      return;
    }

    const newViolation = {
      ...selectedStudent,
      ...formData,
    };

    setViolations((prev) => [...prev, newViolation]);

    // reset dropdowns only
    setFormData({ type: "", sanction: "", violation: "", offense: "1st" });
  };

  // Action Menu Handler (Open Modal)
  const handleMenuAction = (action, student) => {
    let content;

    switch (action) {
      case "View Student Profile":
        content = (
          <div>
            <p><b>ID:</b> {student.id}</p>
            <p><b>Name:</b> {student.name}</p>
            <p><b>Department:</b> {student.dept}</p>
            <p><b>Year:</b> {student.year}</p>
            <p><b>Section:</b> {student.section}</p>
            <p><b>Violation:</b> {student.violation}</p>
          </div>
        );
        break;
      case "Edit Student Profile":
        content = (
          <div>
            <label>Name:</label>
            <input type="text" defaultValue={student.name} />
            <label>Dept:</label>
            <input type="text" defaultValue={student.dept} />
            <label>Year:</label>
            <input type="text" defaultValue={student.year} />
            <label>Section:</label>
            <input type="text" defaultValue={student.section} />
            <label>Violation:</label>
            <input type="text" defaultValue={student.Violation} />
          </div>
        );
        break;
      case "Edit Violation":
        content = (
          <div>
            <label>Violation:</label>
            <input type="text" defaultValue={student.violation} />
            <label>Sanction:</label>
            <input type="text" defaultValue={student.sanction} />
          </div>
        );
        break;
      case "Process":
        {
          // ===========================
          // ADD: Process advances to NEXT step only after save
          // ===========================
          const lastSaved = majorSteps[student.id] || 0; // 0..5
          if ((student.type || student.violation || "").toLowerCase() !== "major" && (formData.type !== "Major")) {
            // If the row doesn't explicitly carry "Major", still allow using tracker
            // but only if tracker exists; otherwise, hint
            if (!lastSaved) {
              content = <p>Please set the violation type to <b>Major</b> first to start the process.</p>;
              break;
            }
          }
          if (lastSaved >= 5) {
            content = <p>All steps are already completed for {student.name}.</p>;
            break;
          }
          const nextStep = Math.min(lastSaved + 1, 5);
          content = (
            <MajorOffenseModal
              step={nextStep}
              student={student}
              savedData={(majorData[student.id] || {})[`step${nextStep}`]}
              onSave={(stepNumber, dataObj) => {
                setMajorData((prev) => {
                  const prevForStudent = prev[student.id] || {};
                  return {
                    ...prev,
                    [student.id]: {
                      ...prevForStudent,
                      [`step${stepNumber}`]: dataObj,
                    },
                  };
                });
                setMajorSteps((prev) => ({
                  ...prev,
                  [student.id]: Math.max(prev[student.id] || 0, stepNumber),
                }));
                setModal({ open: false, title: "", content: null });
              }}
              onClose={() => setModal({ open: false, title: "", content: null })}
            />
          );
          // ===========================
          // END ADD
          // ===========================
        }
        break;
      case "Send Notification":
        content = <p>Notification sent to {student.name}'s email/parent.</p>;
        break;
      default:
        content = <p>Unknown action</p>;
    }

    setModal({ open: true, title: action, content });
    setMenuOpenIndex(null);
  };

  return (
    <div className="incident-container">
      {/* Header */}
      <div className="incident-header-bar">
        <h1 className="incident-title">
          Student Management ▸ Incident Management
        </h1>
        <div className="user-account">
          <img src="/rcclogo.png" alt="RCC Logo" className="account-logo" />
          <span className="account-name">OSA</span>
          <span className="dropdown-icon">▾</span>
        </div>
      </div>

      {/* Violation Entry */}
      <div className="violation-entry">
        <h3>Violation Entry</h3>
        <div className="form-grid">
          <div>
            <label>Name of Student</label>
            <input type="text" value={selectedStudent?.name || ""} readOnly />
          </div>
          <div>
            <label>Year</label>
            <input type="text" value={selectedStudent?.year || ""} readOnly />
          </div>
          <div>
            <label>Student ID</label>
            <input type="text" value={selectedStudent?.id || ""} readOnly />
          </div>
          <div>
            <label>Types of Violation</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="">Select Violation</option>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
            </select>
          </div>
          <div>
            <label>Number of Offense</label>
            <select
              name="offense"
              value={formData.offense}
              onChange={handleChange}
            >
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">Major</option>
            </select>
          </div>
          <div>
            <label>Violation</label>
            <select
              name="violation"
              value={formData.violation}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="No Uniform">No Uniform</option>
              <option value="Cheating">Cheating</option>
              <option value="Disrespect">Disrespect</option>
            </select>
          </div>
          <div>
            <label>Department</label>
            <input type="text" value={selectedStudent?.department || ""} readOnly />
          </div>
          <div>
            <label>Section</label>
            <input type="text" value={selectedStudent?.section || ""} readOnly />
          </div>
          <div>
            <label>Grade</label>
            <input type="text" value={selectedStudent?.grade || ""} readOnly />
          </div>
          <div>
            <label>Strand</label>
            <input type="text" value={selectedStudent?.strand || ""} readOnly />
          </div>

          {/* Sanction in its own grid cell (col 3) */}
          <div>
            <label>Sanction</label>
            <select
              name="sanction"
              value={formData.sanction}
              onChange={handleChange}
            >
              <option value="">Select Sanction</option>
              <option value="">Oral Warning</option>
              <option value="Written Warning">Written Warning</option>
              <option value="Suspension">Suspension</option>
              <option value="">Exclusion</option>
              <option value="Community Service">Community Service</option>
            </select>
          </div>

          {/* Add button moved to the cell beside sanction (below Section) */}
          <div>
            <label style={{ visibility: "hidden" }}>Add</label>
            <button className="add-btn" onClick={handleAddViolation}>
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Table Header Controls */}
      <div className="table-controls">
        <input type="text" placeholder="Search..." />
        <button
          className="bulk-upload"
          onClick={() => document.getElementById("bulkUploadInput").click()}
        >
          Bulk Upload
        </button>
        <input
          type="file"
          id="bulkUploadInput"
          style={{ display: "none" }}
          onChange={handleBulkUpload}
        />
        <button className="export-btn" onClick={handleExport}>
          Export
        </button>
      </div>

      {/* Data Table */}
      <table className="incident-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Year</th>
            <th>Section</th>
            <th>Violation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {violations.map((v, index) => (
            <tr key={index}>
              <td>{v.id}</td>
              <td>{v.name}</td>
              <td>{v.department}</td>
              <td>{v.year}</td>
              <td>{v.section}</td>
              <td>{v.violation}</td>
              <td>
                <button
                  className="menu-btn"
                  onClick={() => {
                    setModal({
                      open: true,
                      title: "Actions",
                      content: (
                        <div className="action-modal-buttons">
                          <button onClick={() => handleMenuAction("View Student Profile", v)}>
                            View Student Profile
                          </button>
                          <button onClick={() => handleMenuAction("Edit Student Profile", v)}>
                            Edit Student Profile
                          </button>
                          <button onClick={() => handleMenuAction("Edit Violation", v)}>
                            Edit Violation
                          </button>
                          <button onClick={() => handleMenuAction("Process", v)}>
                            Process
                          </button>
                          <button onClick={() => handleMenuAction("Send Notification", v)}>
                            Send Notification
                          </button>
                        </div>
                      ),
                    });
                  }}
                >
                  ⋮
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{modal.title}</h2>
            {modal.content}
            <div className="modal-actions">
              <button onClick={() => setModal({ open: false })}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Download Template at Bottom Right */}
      <div className="download-template">
        <button onClick={handleDownloadTemplate}>Download Template</button>
      </div>
    </div>
  );
}

export default IncidentPage;

/* ===========================
   ADD: MajorOffenseModal component
   =========================== */
function MajorOffenseModal({ step, student, savedData, onSave, onClose }) {
  // Local form states for each step; initialize from savedData if available
  const [step1, setStep1] = useState({
    incidentReport: savedData?.incidentReport || "",
  });
  const [step2, setStep2] = useState({
    chairDean: savedData?.chairDean || "",
    facultyMember: savedData?.facultyMember || "",
    sscRep: savedData?.sscRep || "",
    dscRep: savedData?.dscRep || "",
    guidance: savedData?.guidance || "",
  });
  const [step3, setStep3] = useState({
    complainant: !!savedData?.complainant,
    respondentPresent: !!savedData?.respondentPresent,
    parentsPresent: !!savedData?.parentsPresent,
    witnessTestimonies: !!savedData?.witnessTestimonies,
    finalStatements: !!savedData?.finalStatements,
  });
  const [step4, setStep4] = useState({
    sanction: savedData?.sanction || "",
  });
  const [step5, setStep5] = useState({
    decisionApproval: savedData?.decisionApproval || "",
  });

  const renderProgress = (activeIndex) => {
    // Simple dot progress like in the screenshots
    const dots = [1, 2, 3, 4, 5];
    return (
      <div style={{ display: "flex", gap: 8, margin: "6px 0 12px" }}>
        {dots.map((d) => (
          <span
            key={d}
            style={{
              width: 8,
              height: 8,
              borderRadius: 8,
              display: "inline-block",
              background: d <= activeIndex ? "#4b3c2f" : "#d0c9c2",
            }}
          />
        ))}
      </div>
    );
  };

  const saveCurrent = () => {
    if (step === 1) onSave(1, step1);
    else if (step === 2) onSave(2, step2);
    else if (step === 3) onSave(3, step3);
    else if (step === 4) onSave(4, step4);
    else if (step === 5) onSave(5, step5);
  };

  return (
    <div>
      {/* Header text per screenshot */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ background: "#6b4b2a", height: 10, borderRadius: 4, marginBottom: 10 }} />
        <h3 style={{ margin: "0 0 4px 0" }}>Major Offense</h3>
        {step === 1 && <div>Filing & Investigation</div>}
        {step === 2 && <div>Committee on Discipline is formed</div>}
        {step === 3 && <div>Hearing Conducted</div>}
        {step === 4 && <div>Sanction Imposed</div>}
        {step === 5 && <div>Final Decision with committee submitted findings</div>}
        {renderProgress(step)}
      </div>

      {/* Step bodies */}
      {step === 1 && (
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Incident Report</label>
          <textarea
            style={{ width: "100%", minHeight: 120 }}
            placeholder="Write incident report..."
            value={step1.incidentReport}
            onChange={(e) => setStep1({ incidentReport: e.target.value })}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button onClick={onClose}>Back</button>
            <button onClick={saveCurrent}>Save</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label>Appointed Chair or College Dean</label>
              <input
                type="text"
                style={{ width: "100%" }}
                value={step2.chairDean}
                onChange={(e) => setStep2((s) => ({ ...s, chairDean: e.target.value }))}
              />
            </div>
            <div>
              <label>Faculty Member</label>
              <input
                type="text"
                style={{ width: "100%" }}
                value={step2.facultyMember}
                onChange={(e) => setStep2((s) => ({ ...s, facultyMember: e.target.value }))}
              />
            </div>
            <div>
              <label>SSC Chairperson (or rep)</label>
              <input
                type="text"
                style={{ width: "100%" }}
                value={step2.sscRep}
                onChange={(e) => setStep2((s) => ({ ...s, sscRep: e.target.value }))}
              />
            </div>
            <div>
              <label>DSC President (or rep)</label>
              <input
                type="text"
                style={{ width: "100%" }}
                value={step2.dscRep}
                onChange={(e) => setStep2((s) => ({ ...s, dscRep: e.target.value }))}
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Guidance Counselor (non-voting, advisory)</label>
              <input
                type="text"
                style={{ width: "100%" }}
                value={step2.guidance}
                onChange={(e) => setStep2((s) => ({ ...s, guidance: e.target.value }))}
              />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button onClick={onClose}>Back</button>
            <button onClick={saveCurrent}>Save</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ display: "grid", gap: 6 }}>
            <label><input type="checkbox" checked={step3.complainant} onChange={(e) => setStep3((s) => ({ ...s, complainant: e.target.checked }))} /> Complainant</label>
            <label><input type="checkbox" checked={step3.respondentPresent} onChange={(e) => setStep3((s) => ({ ...s, respondentPresent: e.target.checked }))} /> Respondent present.</label>
            <label><input type="checkbox" checked={step3.parentsPresent} onChange={(e) => setStep3((s) => ({ ...s, parentsPresent: e.target.checked }))} /> Parents/Guardians may be present.</label>
            <label><input type="checkbox" checked={step3.witnessTestimonies} onChange={(e) => setStep3((s) => ({ ...s, witnessTestimonies: e.target.checked }))} /> Witness testimonies & cross-examinations.</label>
            <label><input type="checkbox" checked={step3.finalStatements} onChange={(e) => setStep3((s) => ({ ...s, finalStatements: e.target.checked }))} /> Final statements.</label>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button onClick={onClose}>Back</button>
            <button onClick={saveCurrent}>Save</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <label>Choose a Sanction</label>
          <select
            style={{ width: "100%", height: 38 }}
            value={step4.sanction}
            onChange={(e) => setStep4({ sanction: e.target.value })}
          >
            <option value="">Select</option>
            <option value="Suspension">Suspension</option>
            <option value="Exclusion">Exclusion</option>
            <option value="Community Service">Community Service</option>
            <option value="Written Warning">Written Warning</option>
          </select>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button onClick={onClose}>Back</button>
            <button onClick={saveCurrent}>Save</button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <label>Decision Approval</label>
          <select
            style={{ width: "100%", height: 38 }}
            value={step5.decisionApproval}
            onChange={(e) => setStep5({ decisionApproval: e.target.value })}
          >
            <option value="">Select</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button onClick={onClose}>Back</button>
            <button onClick={saveCurrent}>{/* last step still "Save" */}Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
