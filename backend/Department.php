<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database connection
$servername = "localhost";
$username   = "root";  // default XAMPP
$password   = "";      // default XAMPP
$dbname     = "login"; // same database as login

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];

if ($method === "POST") {
    // Get JSON input
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['action'])) {
        echo json_encode(["success" => false, "message" => "No action provided"]);
        exit;
    }

    if ($data['action'] === "add" && isset($data['name']) && isset($data['type'])) {
        $name = $conn->real_escape_string($data['name']);
        $type = $conn->real_escape_string($data['type']);

        $sql = "INSERT INTO departments (name, type) VALUES ('$name', '$type')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Department added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
    }

    if ($data['action'] === "delete" && isset($data['id'])) {
        $id = intval($data['id']);
        $sql = "DELETE FROM departments WHERE id = $id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Department deleted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
    }

    if ($data['action'] === "update" && isset($data['id']) && isset($data['name']) && isset($data['type'])) {
        $id   = intval($data['id']);
        $name = $conn->real_escape_string($data['name']);
        $type = $conn->real_escape_string($data['type']);

        $sql = "UPDATE departments SET name='$name', type='$type' WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Department updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
    }
}

if ($method === "GET") {
    $result = $conn->query("SELECT * FROM departments");
    $departments = [];
    while ($row = $result->fetch_assoc()) {
        $departments[] = $row;
    }
    echo json_encode($departments);
}

$conn->close();
?>
