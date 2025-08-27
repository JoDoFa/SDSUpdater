<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$servername = "localhost";
$username = "root"; // change if needed
$password = "";     // change if you set a password
$dbname = "violation";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

// Detect HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Read JSON body
$data = json_decode(file_get_contents("php://input"), true);

switch ($method) {
    case 'GET':
        $result = $conn->query("SELECT * FROM violations ORDER BY id DESC");
        $violations = [];
        while ($row = $result->fetch_assoc()) {
            $violations[] = $row;
        }
        echo json_encode($violations);
        break;

    case 'POST': // Add
        $violation = $data['violation'];
        $type = $data['type'];
        $severity = $data['severity'];

        $stmt = $conn->prepare("INSERT INTO violations (violation, type, severity) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $violation, $type, $severity);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "id" => $conn->insert_id]);
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }
        break;

    case 'PUT': // Update
        $id = $data['id'];
        $violation = $data['violation'];
        $type = $data['type'];
        $severity = $data['severity'];

        $stmt = $conn->prepare("UPDATE violations SET violation=?, type=?, severity=? WHERE id=?");
        $stmt->bind_param("sssi", $violation, $type, $severity, $id);

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }
        break;

    case 'DELETE': // Delete
        $id = $data['id'];

        $stmt = $conn->prepare("DELETE FROM violations WHERE id=?");
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "message" => $stmt->error]);
        }
        break;

    default:
        echo json_encode(["success" => false, "message" => "Invalid request"]);
        break;
}

$conn->close();
