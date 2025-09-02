<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database connection (XAMPP default)
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "student_discipline"; // <-- use same db as StudentIncident

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// Handle GET requests for report filtering
if ($_SERVER['REQUEST_METHOD'] === "GET") {
    $filters = [];
    
    if (!empty($_GET['department'])) {
        $department = $conn->real_escape_string($_GET['department']);
        $filters[] = "department = '$department'";
    }
    if (!empty($_GET['year'])) {
        $year = intval($_GET['year']);
        $filters[] = "year_level = $year";
    }
    if (!empty($_GET['section'])) {
        $section = $conn->real_escape_string($_GET['section']);
        $filters[] = "section = '$section'";
    }
    if (!empty($_GET['grade'])) {
        $grade = $conn->real_escape_string($_GET['grade']);
        $filters[] = "grade = '$grade'";
    }
    if (!empty($_GET['violation'])) {
        $violation = $conn->real_escape_string($_GET['violation']);
        $filters[] = "description LIKE '%$violation%'";
    }
    if (!empty($_GET['status'])) {
        $status = $conn->real_escape_string($_GET['status']);
        $filters[] = "status = '$status'";
    }
    if (!empty($_GET['from']) && !empty($_GET['to'])) {
        $from = $conn->real_escape_string($_GET['from']);
        $to   = $conn->real_escape_string($_GET['to']);
        $filters[] = "date_reported BETWEEN '$from' AND '$to'";
    }

    $sql = "SELECT * FROM student_incidents";
    if (count($filters) > 0) {
        $sql .= " WHERE " . implode(" AND ", $filters);
    }
    $sql .= " ORDER BY date_reported DESC";

    $result = $conn->query($sql);

    $reports = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $reports[] = $row;
        }
    }

    echo json_encode([
        "success" => true,
        "count"   => count($reports),
        "data"    => $reports
    ]);
}

$conn->close();
?>
