import http from "http";
import WebSocker from "ws";
import express from "express";

const app = express();

//pug로 view engine을 설정
app.set("view engine", "pug");

//express에 template이 어딨는지 지정
app.set("views", __dirname + "/views");

//public url을 생성해서 유저에게 파일을 공유(공개) = 유저가 볼수있는 폴더
//public파일은 frontend에서 구동되는 코드
//매우 중요함. 왜냐하면 여기저기에서 js코드를 다루다보면 어떤게 frontend고 backend것인지 구분하기 힘듬
app.use("/public", express.static(__dirname + "/public"));

//home.pug를 render해주는 route handler을 만듬
app.get("/", (_,res) => res.render("home"));

//어떤 주소로 접근해도 메인으로 이동하도록 함
app.get("/*", (_, res) => res.redirect("/"));

const headleListen = () => console.log(`Listening on http://lacalhost:3000`)
//app.listen(3000, headleListen)

//http서버와 웹소켓 서버 모두 돌리고 싶을 때
//express application으로 부터 http 서버 만들기
const server = http.createServer(app);

//웹소켓 시작
//http서버 위에 웹소켓 서버 만들기 (꼭 http위에 올릴 필요없이 단독으로 만들어도 됨)
const wss = new WebSocker.Server({server})
//여기까지 코드로 인해 lacalhost:3000에서는 http와 ws모두 작동가능


// ***프론트 엔드와 연결하기 위해 필수적으로 있어야 하는 부분은 아니다*** //
//socket : 연결된 브라우저
//브라우저 마다 개별적으로 작동되고 있다. 예를 들어 동일한 주소에 요청을해도 크롬 브라우저로 요청하면 크롬으로 응답하고, IE로 요청하면 IE로 응답한다.

const sockets = [];

wss.on("connection", (socket) => {
    //접근한 브라우저의 socket을 fake db인 array에 추가해준다
    sockets.push(socket);

    //닉네임 설정을 하지 않고 소켓을 실행한 경우 우선 기본 닉네임을 설정해준다.
    socket["nickname"] = "Anon";

    console.log("Conncted to Browser");

    //브라우저 탭을 끄면 socket close된다.
    socket.on("close", () => {
        console.log("Disconncted from Browser 👿");
    });

    //메세지 받기
    socket.on('message', message => {
        const translatedMessageData = message.toString('utf8');
        console.log(translatedMessageData);

        //받은 메세지를 다시 해당 브라우저로 돌려보내기
        //socket.send(translatedMessageData);

        const parsed = JSON.parse(translatedMessageData);
        switch (parsed.type) {
            case "new_message":
                //받은 메세지와 닉네임을 접속된 모든 브라우저로 보내기
                sockets.forEach(aSocket => (aSocket != socket) ? aSocket.send(`${socket.nickname} : ${parsed.payload}`):"");
                break;
            case "nickname":
                //소켓은 기본적으로 객체이기 때문에, item을 추가해주면 된다.
                //해당 소켓의 닉네임은 nickname key값으로 받아온 value값이 된다.
                socket["nickname"] = parsed.payload;
                break;
            default:
                break;
        };
    });

    //메세지 보내기
    //socket.send("hello!!");
});


server.listen(3000, headleListen)