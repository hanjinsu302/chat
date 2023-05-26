const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const http = require("http").Server(app); //socket 기본설정
const io = require("socket.io")(http);
const PORT = 8000;

app.set("view engine", "ejs");
app.use("/views", express.static(__dirname + "/views"));
app.use("/static", express.static(__dirname + "/static"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// [라우터 분리]
const indexRouter = require("./routes"); // index는 생략 가능!
app.use("/", indexRouter);

const userRouter = require("./routes/user"); // index는 생략 가능!
app.use("/user", userRouter);

// [404 error] 맨 마지막 라우트로 선언 -> 나머지 코드 무시되기 때문!!
app.get("*", (req, res) => {
  res.render("404");
});

const nickObj = {};
let numUsers = 0; //접속자수 확인 코드

function updateNickList() {
  io.emit("updateNicks", nickObj, numUsers);
}

io.on("connection", (socket) => {
  console.log("⭕ server socket connected>>", socket.id);
  numUsers++;
  io.emit("userCount", numUsers);

  socket.on("setNick", (nick) => {
    console.log("socket on setNick >>", nick);

    if (Object.values(nickObj).indexOf(nick) > -1) {
      socket.emit("error", "누군가 사용중인 닉네임 입니다!!");
    } else {
      //아이디 통과
      nickObj[socket.id] = nick; // nickObj 객첵에 "소켓_아이디: 닉네임" 추가
      io.emit(
        "notice",
        `${nick}님이 입장 하였습니다.현재 접속자 수: ${numUsers}명`
      ); //입장 메세지 "전체 공지"
      // 전체 공지 => 서버에 접속한 모든 클라이언트에게 이벤트 전송
      socket.emit("entrySuccess", nick); //입장 성공시
      updateNickList(); //닉네임 리스트 객체 업데이트
    }
  });

  //[실습 3-3] 접속자 퇴장
  //disconnect event: 클라이언트가 연결을 끊었을 때 발생 (브라우저 탭 닫음)
  socket.on("disconnect", () => {
    console.log("*** ❌ Server Socket Disonnected >>", socket.id);
    numUsers--; // 접속자 수 1 감소
    io.emit("userCount", numUsers);

    io.emit(
      "notice",
      `${nickObj[socket.id]}님이 퇴장 하였습니다.현재 접속자 수: ${numUsers}명`
    );
    delete nickObj[socket.id];
    updateNickList();
  });

  socket.on("send", (obj) => {
    console.log("socket on send >>", obj);
    if (!obj.msg) {
      socket.emit("error", "메시지를 입력해주세요!");
      return;
    }

    if (obj.dm !== "all") {
      //dm전송
      let dmSocketId = obj.dm; //각 닉네임에 해당하는 socket.id
      const sendData = { nick: obj.myNick, dm: "(귓속말)", msg: obj.msg };
      //1. dm을 보내고자하는 그 socket.id 한테 메세지 전송
      io.to(dmSocketId).emit("newMessage", sendData);
      //2. dm을 보내고 있는 자기 자신 메세지 전송
      socket.emit("newMessage", sendData);
    } else {
      //all전송
      const sendData = { nick: obj.myNick, msg: obj.msg };
      io.emit("newMessage", sendData);
    }
  });
});

http.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
