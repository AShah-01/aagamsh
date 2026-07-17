<?php
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$rawBody = file_get_contents('php://input');
$decodedJson = json_decode($rawBody, true);
$inputData = is_array($decodedJson) ? $decodedJson : $_POST;

if (!is_array($inputData)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request payload']);
    exit;
}

$requiredFields = ['name', 'email', 'subject', 'message'];
foreach ($requiredFields as $field) {
    if (!isset($inputData[$field]) || trim((string) $inputData[$field]) === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }
}

$name = sanitizeInput($inputData['name']);
$email = sanitizeInput($inputData['email']);
$subject = sanitizeInput($inputData['subject']);
$message = sanitizeInput($inputData['message']);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

$recipientEmail = 'aagamshah250506@gmail.com';
$emailSubject = $subject . ' - Website';

$emailBody = "You have received a new message from your website contact form.\n\n";
$emailBody .= "From: " . $name . "\n";
$emailBody .= "Email: " . $email . "\n";
$emailBody .= "Subject: " . $subject . "\n";
$emailBody .= "Message Source: Website Contact Form\n\n";
$emailBody .= "------- Message -------\n\n";
$emailBody .= $message . "\n\n";
$emailBody .= "------- End of Message -------\n\n";
$emailBody .= "This message was sent from your website's contact form.";

// Use your own inbox as sender and visitor email as Reply-To to avoid mail rejection.
$headers = "From: Website Contact <aagamshah250506@gmail.com>\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$emailSent = @mail($recipientEmail, $emailSubject, $emailBody, $headers);

if ($emailSent) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Email sent successfully!']);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send email from server. Mail service may not be configured.',
    ]);
}

function sanitizeInput($input)
{
    return htmlspecialchars(stripslashes(trim((string) $input)), ENT_QUOTES, 'UTF-8');
}
?>
