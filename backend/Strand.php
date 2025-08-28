<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database connection
$servername = "localhost";
$username   = "root";  // default XAMPP
$password   = "";      // default XAMPP
$dbname     = "login"; // same database

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

    // ADD STRAND
    if ($data['action'] === "add" && isset($data['strand_name']) && isset($data['type'])) {
        $strand_name = $conn->real_escape_string($data['strand_name']);
        $type = $conn->real_escape_string($data['type']);

        $sql = "INSERT INTO strand (strand_name, type) VALUES ('$strand_name', '$type')";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Strand added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
    }

    // DELETE STRAND
    if ($data['action'] === "delete" && isset($data['id'])) {
        $id = intval($data['id']);
        $sql = "DELETE FROM strand WHERE id = $id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Strand deleted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
    }

    // UPDATE STRAND
    if ($data['action'] === "update" && isset($data['id']) && isset($data['strand_name']) && isset($data['type'])) {
        $id   = intval($data['id']);
        $strand_name = $conn->real_escape_string($data['strand_name']);
        $type = $conn->real_escape_string($data['type']);

        $sql = "UPDATE strand SET strand_name='$strand_name', type='$type' WHERE id=$id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "Strand updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
    }
}

// GET STRANDS
if ($method === "GET") {
    $result = $conn->query("SELECT * FROM strand");
    $strands = [];
    while ($row = $result->fetch_assoc()) {
        $strands[] = $row;
    }
    echo json_encode($strands);
}

$conn->close();
?>
