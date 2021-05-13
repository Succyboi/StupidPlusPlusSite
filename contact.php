<?php
 
if($_POST) {
    $visitor_name = "";
    $visitor_email = "";
    $email_title = "Message left on your website.";
    $visitor_message = "";
     
    if(isset($_POST['visitor_name'])) {
        $visitor_name = filter_var($_POST['visitor_name'], FILTER_SANITIZE_STRING);
    }
     
    if(isset($_POST['visitor_email'])) {
        $visitor_email = str_replace(array("\r", "\n", "%0a", "%0d"), '', $_POST['visitor_email']);
        $visitor_email = filter_var($visitor_email, FILTER_VALIDATE_EMAIL);
        $headers = "From: " . $visitor_email;
    }
    else {
        $headers = "From: someone@your-website.com";
    }
    
    if(isset($_POST['visitor_message'])) {
        $visitor_message = htmlspecialchars($_POST['visitor_message']) . " -" . $visitor_name;
    }
     
    $recipient = "stupidplusplus@gmail.com";
     
    if(mail($recipient, $email_title, $visitor_message, $headers)) {
        header("Location: success.html");
        exit();
    } else {
        header("Location: oops.html");
        exit();
    }
     
} else {
    header("Location: oops.html");
    exit();
}
 
?>