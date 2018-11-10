// 網路
var ws;
function WebSocketTest() {

    if ("WebSocket" in window) {
        // alert("WebSocket is supported by your Browser!");

        // Let us open a web socket
        ws = new WebSocket("ws://172.20.10.4:8000/ws");
        // ws = new WebSocket("ws://127.0.0.1:8000/ws");

        ws.onopen = function() {
            console.log("Connection is connected...");
        };

        ws.onmessage = function (evt) {
            var received_msg = evt.data;
            var obj = JSON.parse(received_msg);
            event = JSON.parse(obj.message);
            switch (event.data) {
                case 'left_up':
                    leftA.release();
                break;
                case 'left_down':
                    leftA.press();
                break;
                case 'right_up':
                    rightA.release();
                break;
                case 'right_down':
                    rightA.press();
                break;
                case 'jump_up':
                    jumpA.release();
                break;
                case 'jump_down':
                    jumpA.press();
                break;
            }
            // showLog(obj.message);
        };

        ws.onclose = function() {
            console.log("Connection is closed...");
        };
    } else {

        // The browser doesn't support WebSocket
        console.log("WebSocket NOT supported by your Browser!");
    }

    function showLog(val){
        var log = document.getElementById("log");
        log.innerHTML += val + " <br/>";
    }

    function setPlayground() {
        ws.send(JSON.stringify({
            type: "playground",
            channel: "1",
            message: ""
        }));
    }
}