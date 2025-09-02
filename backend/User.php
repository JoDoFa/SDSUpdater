<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database connection
$servername = "localhost";
$username   = "root";   // default XAMPP
$password   = "";       // default XAMPP
$dbname     = "sds_db"; // new database name

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

    // Add User
    if ($data['action'] === "add" && isset($data['username']) && isset($data['password']) && isset($data['role']) && isset($data['full_name'])) {
        $username = $conn->real_escape_string($data['username']);
        $password = password_hash($data['password'], PASSWORD_DEFAULT); // hashed password
        $role     = $conn->real_escape_string($data['role']);
        $fullName = $conn->real_escape_string($data['full_name']);
        $email    = isset($data['email']) ? $conn->real_escape_string($data['email']) : null;

        $sql = "INSERT INTO users (username, password, role, full_name, email) 
                VALUES ('$username', '$password', '$role', '$fullName', " . ($email ? "'$email'" : "NULL") . ")";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "User added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
    }

    // Delete User
    if ($data['action'] === "delete" && isset($data['id'])) {
        $id = intval($data['id']);
        $sql = "DELETE FROM users WHERE user_id = $id";
        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "User deleted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
    }

    // Update User
    if ($data['action'] === "update" && isset($data['id']) && isset($data['username']) && isset($data['role']) && isset($data['full_name'])) {
        $id       = intval($data['id']);
        $username = $conn->real_escape_string($data['username']);
        $role     = $conn->real_escape_string($data['role']);
        $fullName = $conn->real_escape_string($data['full_name']);
        $email    = isset($data['email']) ? $conn->real_escape_string($data['email']) : null;

        // If password is provided, update it too
        $passwordUpdate = "";
        if (!empty($data['password'])) {
            $password = password_hash($data['password'], PASSWORD_DEFAULT);
            $passwordUpdate = ", password='$password'";
        }

        $sql = "UPDATE users SET username='$username', role='$role', full_name='$fullName', 
                email=" . ($email ? "'$email'" : "NULL") . " $passwordUpdate WHERE user_id=$id";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "User updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error: " . $conn->error]);
        }
    }
}

// Fetch all users
if ($method === "GET") {
    $result = $conn->query("SELECT user_id, username, role, full_name, email, created_at FROM users");
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    echo json_encode($users);
}

$conn->close();
?>
