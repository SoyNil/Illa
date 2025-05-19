<?php
session_start();
include "../Controlador/conexion.php"; // Incluir la conexión PDO

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $mensaje = trim($_POST["mensaje"]);

    if (empty($mensaje)) {
        echo "Error: No se puede enviar un mensaje vacío.";
        exit();
    }

    // Obtener el esquema completo de la base de datos
    $schema = [];
    $stmt = $pdo->query("SHOW TABLES");
    $tablas = $stmt->fetchAll(PDO::FETCH_COLUMN);

    foreach ($tablas as $tabla) {
        $stmt = $pdo->prepare("SHOW COLUMNS FROM `$tabla`");
        $stmt->execute();
        $columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $schema[$tabla] = [
            'columns' => array_map(function($col) {
                return [
                    'name' => $col['Field'],
                    'type' => $col['Type'],
                    'null' => $col['Null'],
                    'key' => $col['Key'],
                    'default' => $col['Default'],
                    'extra' => $col['Extra']
                ];
            }, $columnas)
        ];

        // Obtener claves foráneas
        $stmt = $pdo->query("SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME 
                             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                             WHERE TABLE_NAME = '$tabla' AND REFERENCED_TABLE_NAME IS NOT NULL");
        $foreign_keys = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if ($foreign_keys) {
            $schema[$tabla]['foreign_keys'] = $foreign_keys;
        }
    }

    // Construir una descripción detallada del esquema
    $schema_description = "Base de datos: base_sueldo\n\n";
    $schema_description .= "Notas importantes:\n";
    $schema_description .= "- La tabla `pacientes` tiene una columna `Fecha` (tipo date) que indica la fecha de la cita, es decir, la fecha en que el paciente fue atendido.\n";
    $schema_description .= "- La columna `fecha_actual` en `pacientes` indica la fecha de registro del paciente y NO debe usarse para consultas sobre atenciones.\n";
    $schema_description .= "- La columna `Atendido` en `pacientes` (tipo tinyint) indica si el paciente fue atendido (1) o no (0).\n";
    $schema_description .= "- La columna `Precio_Descuento` en `pacientes` (tipo decimal) indica el monto a pagar por el paciente después de aplicar el descuento.\n";
    $schema_description .= "- Para relacionar `pacientes` con `registro`, usa `pacientes.Usuario_ID` que referencia `registro.ID`.\n";
    $schema_description .= "- Preguntas sobre pagos (por ejemplo, 'cuánto se le debe pagar a un usuario') deben calcular la suma de `Precio_Descuento` para pacientes con `Atendido = 1` relacionados con el usuario.\n\n";

    foreach ($schema as $tabla => $info) {
        $schema_description .= "Tabla: $tabla\n";
        $schema_description .= "Columnas:\n";
        foreach ($info['columns'] as $col) {
            $schema_description .= "- {$col['name']} ({$col['type']})";
            if ($col['null'] === 'NO') $schema_description .= ", NOT NULL";
            if ($col['key'] === 'PRI') $schema_description .= ", PRIMARY KEY";
            if ($col['default']) $schema_description .= ", DEFAULT {$col['default']}";
            if ($col['extra']) $schema_description .= ", {$col['extra']}";
            $schema_description .= "\n";
        }
        if (isset($info['foreign_keys'])) {
            $schema_description .= "Claves foráneas:\n";
            foreach ($info['foreign_keys'] as $fk) {
                $schema_description .= "- {$fk['COLUMN_NAME']} -> {$fk['REFERENCED_TABLE_NAME']}.{$fk['REFERENCED_COLUMN_NAME']}\n";
            }
        }
        $schema_description .= "\n";
    }

    // Manejo directo de preguntas comunes
    $respuesta = "";
    $handled_locally = false;

    // Pregunta: Cuántos pacientes fueron atendidos en la última semana
    if (preg_match("/\b(cuantos|cuántos)\s+pacientes.*(atendidos|atendió).*(\búltima semana|\bultima semana|\búltimos 7 días|\bultimos 7 dias)\b/i", $mensaje)) {
        $handled_locally = true;
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM pacientes WHERE Atendido = 1 AND Fecha >= CURDATE() - INTERVAL 7 DAY");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $count = $result['total'];
            if ($count == 0) {
                $respuesta = "No se atendieron pacientes en la última semana.";
            } else {
                $respuesta = "Se atendieron $count pacientes en la última semana.";
            }
        } catch (PDOException $e) {
            $respuesta = "Error al procesar la consulta: " . $e->getMessage();
        }
    }

    // Pregunta: Cuántos pacientes atendió un usuario específico
    if (preg_match("/\b(cuantos|cuántos)\s+pacientes.*(atendidos|atendió)\s+([\w_]+)\b/i", $mensaje, $matches)) {
        $handled_locally = true;
        $usuario = $matches[3];
        try {
            $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM pacientes p JOIN registro r ON p.Usuario_ID = r.ID WHERE r.Usuario = ? AND p.Atendido = 1");
            $stmt->execute([$usuario]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $count = $result['total'];
            if ($count == 0) {
                $respuesta = "$usuario no atendió pacientes.";
            } else {
                $respuesta = "$usuario atendió $count paciente" . ($count > 1 ? "s" : "") . ".";
            }
        } catch (PDOException $e) {
            $respuesta = "Error al procesar la consulta: " . $e->getMessage();
        }
    }

    // Pregunta: Cuánto se le debe pagar a un usuario específico
    if (preg_match("/\b(cuanto|cuánto)\s+(se le debe pagar|pagar)\s+a\s+([\w_]+)\b/i", $mensaje, $matches)) {
        $handled_locally = true;
        $usuario = $matches[3];
        try {
            $stmt = $pdo->prepare("SELECT SUM(p.Precio_Descuento) as total FROM pacientes p JOIN registro r ON p.Usuario_ID = r.ID WHERE r.Usuario = ? AND p.Atendido = 1");
            $stmt->execute([$usuario]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $total = $result['total'];
            if ($total === null || $total == 0) {
                $respuesta = "No hay pagos pendientes para $usuario.";
            } else {
                $respuesta = "Se le debe pagar $$total a $usuario.";
            }
        } catch (PDOException $e) {
            $respuesta = "Error al procesar la consulta: " . $e->getMessage();
        }
    }

    // Si no se manejó localmente, enviar a Together AI
    if (!$handled_locally) {
        $together_api_key = "d285b1cfe48c461f457e1a3d0241826e4f17d04bc98e5dead7d48c9107912a4e";
        $together_api_url = "https://api.together.xyz/v1/chat/completions";

        $data = [
            "model" => "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
            "messages" => [
                [
                    "role" => "system",
                    "content" => "Eres un asistente que responde preguntas sobre una base de datos MySQL llamada 'base_sueldo'. " .
                                 "Proporciona respuestas breves, claras y en lenguaje natural, basadas únicamente en la información del esquema proporcionado. " .
                                 "Si la pregunta requiere una consulta SQL, genera la consulta internamente y devuelve solo el resultado final en una frase clara. " .
                                 "No incluyas la consulta SQL ni explicaciones técnicas a menos que se soliciten explícitamente con palabras como 'muestra la consulta' o 'explica'. " .
                                 "No menciones limitaciones como 'no tengo acceso a los datos'. " .
                                 "Si no hay datos, indica claramente que no se encontraron resultados y sugiere una posible razón. " .
                                 "Esquema de la base de datos:\n\n$schema_description"
                ],
                ["role" => "user", "content" => $mensaje]
            ],
            "temperature" => 0.7,
            "max_tokens" => 200
        ];

        $ch = curl_init($together_api_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Authorization: Bearer $together_api_key"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_code !== 200) {
            echo "Error: No se pudo conectar con el servicio de IA. Código HTTP: $http_code";
            exit();
        }

        $result = json_decode($response, true);
        $respuesta = $result["choices"][0]["message"]["content"] ?? "Error en la respuesta del bot.";

        // Extraer y ejecutar consulta SQL si existe
        if (preg_match('/```sql\n(.*?)\n```/s', $respuesta, $matches)) {
            $sql_query = trim($matches[1]);
            // Validar la consulta
            if (stripos($sql_query, 'fecha_actual') !== false && stripos($mensaje, 'atendid') !== false) {
                $sql_query = preg_replace('/fecha_actual/', 'Fecha', $sql_query);
            }
            try {
                $stmt = $pdo->query($sql_query);
                $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Procesar el resultado
                if (empty($resultados)) {
                    $respuesta = "No se encontraron datos. Es posible que no haya registros que coincidan con la consulta.";
                } else {
                    $first_row = $resultados[0];
                    $key = key($first_row);
                    $value = $first_row[$key];
                    
                    if (stripos($sql_query, 'COUNT') !== false) {
                        if ($value == 0) {
                            $respuesta = "No se encontraron resultados para la consulta.";
                        } else {
                            $respuesta = "Se encontraron $value resultados.";
                        }
                    } elseif (stripos($sql_query, 'SUM') !== false) {
                        if ($value === null || $value == 0) {
                            $respuesta = "No hay montos a pagar.";
                        } else {
                            $respuesta = "El total a pagar es $$value.";
                        }
                    } else {
                        $respuesta = json_encode($resultados, JSON_PRETTY_PRINT);
                    }
                }
            } catch (PDOException $e) {
                $respuesta = "Error al procesar la consulta: " . $e->getMessage();
            }
        }

        // Filtrar bloques de código SQL de la respuesta
        $respuesta = preg_replace('/```sql\n(.*?)\n```/s', '', $respuesta);
    }

    echo trim($respuesta);
    exit();
}
?>

<link rel="stylesheet" href="../Modelo/estilosChatBot.css">
<!-- INTERFAZ DEL CHATBOT -->
<div class="chat-container">
    <div class="chat-header">IllaBot</div>
    <div id="chat" class="chat-body"></div>
    <div class="chat-input">
        <input type="text" id="mensaje" placeholder="Escribe un mensaje..." onkeypress="if(event.key === 'Enter') enviarMensaje();">
        <button onclick="enviarMensaje()">Enviar</button>
    </div>
</div>

<script>
function enviarMensaje() {
    var mensaje = document.getElementById("mensaje").value.trim();
    if (mensaje === "") {
        alert("No puedes enviar un mensaje vacío.");
        return;
    }

    var chatBody = document.getElementById("chat");
    chatBody.innerHTML += "<p class='user'><strong>Tú:</strong> " + mensaje + "</p>";
    chatBody.innerHTML += "<p><strong>Bot:</strong> <span class='loading'>Cargando...</span></p>";
    chatBody.scrollTop = chatBody.scrollHeight;

    var xhr = new XMLHttpwiazdRequest();
    xhr.open("POST", "chatbot.php", true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var botMessages = chatBody.getElementsByTagName("p");
            var lastBotMessage = botMessages[botMessages.length - 1];
            if (xhr.status == 200) {
                lastBotMessage.innerHTML = "<strong>Bot:</strong> " + xhr.responseText.replace(/\n/g, "<br>");
            } else {
                lastBotMessage.innerHTML = "<strong>Bot:</strong> Error en la respuesta.";
            }
            document.getElementById("mensaje").value = "";
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    };
    xhr.send("mensaje=" + encodeURIComponent(mensaje));
}
</script>