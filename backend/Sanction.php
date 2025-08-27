<?php
// Sanction.php

/*************** CONFIG: change these 4 lines when you add/move databases ***************/
$DB_HOST = '127.0.0.1';         // e.g. 'localhost'
$DB_NAME = 'sanction';// your database (from the SQL above)
$DB_USER = 'root';              // your MySQL user
$DB_PASS = '';                  // your MySQL password
/***************************************************************************************/

// --- CORS (adjust origin as needed) ---
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';
header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// --- DB connection ---
try {
  $dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";
  $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'DB connection failed', 'detail' => $e->getMessage()]);
  exit;
}

// --- Helpers ---
function json_input() {
  $raw = file_get_contents('php://input');
  if ($raw === false || $raw === '') return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}

function respond($status, $payload) {
  http_response_code($status);
  echo json_encode($payload);
  exit;
}

function validate_fields($data, $required) {
  $missing = [];
  foreach ($required as $f) {
    if (!isset($data[$f]) || $data[$f] === '') $missing[] = $f;
  }
  return $missing;
}

// --- Route by method ---
$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

try {
  switch ($method) {
    case 'GET':
      // optional search/filter via query string
      // ?q=search&type=Minor&offense=1st&severity=High
      $q = isset($_GET['q']) ? trim($_GET['q']) : '';
      $type = isset($_GET['type']) ? $_GET['type'] : '';
      $offense = isset($_GET['offense']) ? $_GET['offense'] : '';
      $severity = isset($_GET['severity']) ? $_GET['severity'] : '';

      if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM sanctions WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) respond(404, ['ok' => false, 'error' => 'Not found']);
        respond(200, ['ok' => true, 'data' => $row]);
      } else {
        $sql = "SELECT * FROM sanctions WHERE 1=1";
        $params = [];

        if ($q !== '') {
          $sql .= " AND sanction LIKE ?";
          $params[] = "%$q%";
        }
        if ($type !== '') {
          $sql .= " AND type = ?";
          $params[] = $type;
        }
        if ($offense !== '') {
          $sql .= " AND offense = ?";
          $params[] = $offense;
        }
        if ($severity !== '') {
          $sql .= " AND severity = ?";
          $params[] = $severity;
        }

        $sql .= " ORDER BY created_at DESC, id DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll();
        respond(200, ['ok' => true, 'data' => $rows]);
      }
      break;

    case 'POST':
      $data = json_input();
      $missing = validate_fields($data, ['sanction','type','offense','severity']);
      if ($missing) {
        respond(422, ['ok' => false, 'error' => 'Missing fields', 'fields' => $missing]);
      }

      $stmt = $pdo->prepare("INSERT INTO sanctions (sanction, type, offense, severity) VALUES (?, ?, ?, ?)");
      $stmt->execute([
        $data['sanction'],
        $data['type'],
        $data['offense'],
        $data['severity']
      ]);
      $newId = (int)$pdo->lastInsertId();

      $stmt = $pdo->prepare("SELECT * FROM sanctions WHERE id = ?");
      $stmt->execute([$newId]);
      $row = $stmt->fetch();
      respond(201, ['ok' => true, 'data' => $row]);
      break;

    case 'PUT':
      if (!$id) respond(400, ['ok' => false, 'error' => 'Missing id']);
      $data = json_input();

      // Only update provided fields
      $fields = [];
      $params = [];
      foreach (['sanction','type','offense','severity'] as $f) {
        if (isset($data[$f]) && $data[$f] !== '') {
          $fields[] = "$f = ?";
          $params[] = $data[$f];
        }
      }
      if (empty($fields)) respond(422, ['ok' => false, 'error' => 'No fields to update']);

      $params[] = $id;
      $sql = "UPDATE sanctions SET ".implode(", ", $fields)." WHERE id = ?";
      $stmt = $pdo->prepare($sql);
      $stmt->execute($params);

      $stmt = $pdo->prepare("SELECT * FROM sanctions WHERE id = ?");
      $stmt->execute([$id]);
      $row = $stmt->fetch();
      respond(200, ['ok' => true, 'data' => $row]);
      break;

    case 'DELETE':
      if (!$id) respond(400, ['ok' => false, 'error' => 'Missing id']);
      $stmt = $pdo->prepare("DELETE FROM sanctions WHERE id = ?");
      $stmt->execute([$id]);
      respond(200, ['ok' => true, 'data' => ['id' => $id]]);
      break;

    default:
      respond(405, ['ok' => false, 'error' => 'Method not allowed']);
  }
} catch (Exception $e) {
  respond(500, ['ok' => false, 'error' => 'Server error', 'detail' => $e->getMessage()]);
}
