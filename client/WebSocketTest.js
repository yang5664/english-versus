// 網路
var ws;
function WebSocketTest() {

    if ("WebSocket" in window) {
        // alert("WebSocket is supported by your Browser!");

        // Let us open a web socket
        ws = new WebSocket("ws://www.b91.work:8000/ws");
        // ws = new WebSocket("ws://127.0.0.1:8000/ws");

        ws.onopen = function() {
            console.log("Connection is connected...");
            setPlayground();
        };

        ws.onmessage = function (evt) {
            var received_msg = evt.data;
            var obj = JSON.parse(received_msg);
            // console.log(obj);

            if(obj.type == 'playground') {
                showPlayersQRCode(obj.playground_id);
            }
            
            if(obj.type == 'join') {
                if (obj.message == "1") {
                    playerA.alpha = 1;
                } else {
                    playerB.alpha = 1;
                }

                if (playerA.alpha && playerB.alpha) {
                    ready();
                }
            }
            
            if (obj.type == 'action'){
                event = JSON.parse(obj.message);
                switch (event.data) {
                    case 'left_up':
                        if (event.no == '1') {
                            leftA.release();
                        } else {
                            leftB.release();
                        }
                    break;
                    case 'left_down':
                        if (event.no == '1') {
                            leftA.press();
                        } else {
                            leftB.press();
                        }
                    break;
                    case 'right_up':
                        if (event.no == '1') {
                            rightA.release();
                        } else {
                            rightB.release();
                        }
                    break;
                    case 'right_down':
                        if (event.no == '1') {
                            rightA.press();
                        } else {
                            rightB.press();
                        }
                    break;
                    case 'jump_up':
                        if (event.no == '1') {
                            jumpA.release();
                        } else {
                            jumpB.release();
                        }
                    break;
                    case 'jump_down':
                        if (event.no == '1') {
                            jumpA.press();
                        } else {
                            jumpB.press();
                        }
                    break;
                }
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
            playground_id: "",
            message: ""
        }));
    }

    function showPlayersQRCode(val) {
        // 顯示player登入的QRCode
        // src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=Hello%20world&choe=UTF-8"
        var p1 = document.getElementById("p1");
        var url1 = encodeURIComponent("http://www.5floor.net/english-versus/index.html?playground_id=" + val);
        p1.innerHTML = "<img src='https://chart.googleapis.com/chart?chs=350x350&amp;cht=qr&amp;chl="+url1+"&amp;choe=UTF-8' alt='QR code'>";

    }
}