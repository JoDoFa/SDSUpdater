<?php
// Allow requests from other devices
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight (OPTIONS request)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database credentials
$servername = "localhost";   // Use localhost since PHP runs on the same server
$username   = "root";        // Default XAMPP user
$password   = "";            // Default XAMPP password
$dbname     = "login";

// Connect to database
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

// Get JSON input
$rawInput = file_get_contents("php://input");
$data = json_decode($rawInput, true);

// Validate input
if (!is_array($data) || empty($data["email"]) || empty($data["password"])) {
    echo json_encode(["success" => false, "message" => "Missing email or password"]);
    exit;
}

$email    = $conn->real_escape_string($data["email"]);
$password = $data["password"];

// Use prepared statements
$stmt = $conn->prepare("SELECT id, email, password FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    // Compare hashed password
    if (hash_equals($user['password'], hash('sha256', $password))) {
        unset($user['password']); // Don't send password back
        echo json_encode([
            "success" => true,
            "message" => "Login successful",
            "user" => $user
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid credentials"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid credentials"]);
}

$stmt->close();
$conn->close();
?>
