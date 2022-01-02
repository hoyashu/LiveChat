const messageList = document.querySelector('ul');
const messageForm = document.querySelector('#msg');
const nickForm = document.querySelector('#nick');

//JSON형식의 메세지를 웹소켓 전송을 위해 TEXT형식으로 바꿔주는 메서드
function makeMessage(type, payload){
    //object형으로 만들기
    const msg = {type, payload};
    //object형을 text형으로 바꾸기
    return JSON.stringify(msg);
};

//프론트엔드에서 백엔드로 연결하는 방법
// socket : 연결된 서버
const socket = new WebSocket(`ws://${window.location.host}`);

//서버에 온라인 했을때
socket.addEventListener("open",()=>{
    console.log("Conncted to Server 😜")
})

//메세지 받기
socket.addEventListener("message",(message)=>{
       
    //const jsonMsg = JSON.parse(message.data);

    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
    console.log("Just got this : ", message.data, "form the server")
})

//서버가 오프라인 할떄
socket.addEventListener("close", ()=>{
    console.log("Conncted to Server 👿")
})

//서버에게 메세지 전송
// setTimeout(() => {
//     socket.send("hello from the Broswer");
// }, 10000);

messageForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const input = messageForm.querySelector('input');
    socket.send(makeMessage("new_message", input.value));

    input.value = "";
});

nickForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const input = nickForm.querySelector('input');
    socket.send(makeMessage("nickname" , input.value));
});