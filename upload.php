<?php
    $file = $_FILES["file"];
    
    copy($file["tmp_name"], $_SERVER['DOCUMENT_ROOT'] . '/bucket/' . $file["name"]);
    
    var_dump($_FILES["file"]);

?>