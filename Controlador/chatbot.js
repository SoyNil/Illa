// ChatBot JavaScript
document.addEventListener("DOMContentLoaded", () => {
    let chatLoaded = false;
    let chatBtn = document.getElementById("chatgpt-btn");
    let chatBox = document.getElementById("chatgpt-container");
    let closeChat = document.getElementById("close-chat");

    if (!chatBtn || !chatBox || !closeChat) {
        console.error("Uno o más elementos del chatbot no se encontraron en el DOM.");
        return;
    }

    chatBtn.addEventListener("click", function () {
        if (chatBox.style.display === "none" || chatBox.style.display === "") {
            chatBox.style.display = "flex";
            chatBox.style.animation = "abrirChat 0.3s ease-out"; // Agrega la animación de apertura
            chatBtn.style.animation = "cerrarChat 0.3s ease-out";
            setTimeout(() => {
                chatBtn.style.display = "none"; // Oculta el botón después de la animación
            }, 300);

            if (!chatLoaded) {
                fetch('../Controlador/chatbot.php') // Ruta consistente
                    .then(response => response.text())
                    .then(data => {
                        document.getElementById("chat-content").innerHTML = data;
                        chatLoaded = true;
                        // 📌 Volver a cargar el script del chatbot
                        let script = document.createElement("script");
                        script.textContent = `
                            function enviarMensaje() {
                                var mensaje = document.getElementById("mensaje").value.trim();
                                if (mensaje === "") {
                                    alert("No puedes enviar un mensaje vacío.");
                                    return;
                                }

                                var chatBody = document.getElementById("chat");

                                // 📌 Agregar el mensaje del usuario con la misma estructura de burbuja
                                let userMessage = document.createElement("div");
                                userMessage.classList.add("mensaje", "usuario");
                                userMessage.innerHTML = "<strong>Tú:</strong> " + mensaje;
                                chatBody.appendChild(userMessage);

                                var xhr = new XMLHttpRequest();
                                xhr.open("POST", "../Controlador/chatbot.php", true); // Ruta corregida aquí
                                xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                                xhr.onreadystatechange = function () {
                                    if (xhr.readyState == 4) {
                                        let botMessage = document.createElement("div");
                                        botMessage.classList.add("mensaje", "bot");

                                        if (xhr.status == 200) {
                                            botMessage.innerHTML = "<strong>Bot:</strong> " + xhr.responseText;
                                        } else {
                                            botMessage.innerHTML = "<strong>Bot:</strong> Error en la respuesta.";
                                        }

                                        chatBody.appendChild(botMessage);

                                        // 📌 Hacer scroll automático hacia el último mensaje
                                        chatBody.scrollTop = chatBody.scrollHeight;
                                        document.getElementById("mensaje").value = "";
                                    }
                                };
                                xhr.send("mensaje=" + encodeURIComponent(mensaje));
                            }
                        `;
                        document.body.appendChild(script);
                    })
                    .catch(error => console.error("Error al cargar el chatbot:", error));
            }
        } else {
            chatBox.style.display = "none";
            chatBtn.style.display = "block"; // Mostrar el botón cuando se cierra el chat
        }
    });

    // Cerrar chat
    closeChat.addEventListener("click", function () {
        chatBox.style.animation = "cerrarChat 0.3s ease-in"; // Aplica animación de cierre
        setTimeout(() => {
            chatBox.style.display = "none"; // Oculta el chat después de la animación
            chatBtn.style.display = "block";
            chatBtn.style.animation = "abrirChat 0.3s ease-out"; // Animación de aparición del botón
        }, 300);
    });
});
