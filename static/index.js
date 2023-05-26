// front-end js

// sockt 사용의 위해서 객체 생성
let socket = io.connect();

//나의 닉네임
let myNick;

socket.on("connect", () => {
  console.log("⭕ client socket connected>>", socket.id);
});

//[실습1]
// function sayHello() {
//   //clinet -> server 정보 보내기
//   // socket.emit(event, data): 데이터 전송
//   // => event 라는 이름으로 data를 전송
//   // hello라는 이름이로 객체를 전송
//   socket.emit("hello", { who: "client", msg: "hello" });

//   // socket.on(event, callback): 데이터 "받음"
//   // event에 대해서 정보를 받아 callback 함수 실행
//   socket.on("helloKr", (data) => {
//     const p = document.querySelector("#form-server");
//     p.textContent = `${data.who} : ${data.msg}`;
//   });
// }

// function sayStudy() {
//   socket.emit("study", { who: "client", msg: "study" });

//   socket.on("studyhard", (data) => {
//     const p = document.querySelector("#form-server");
//     p.textContent = `${data.who} : ${data.msg}`;
//   });
// }

// function sayBye() {
//   socket.emit("bye", { who: "client", msg: "bye" });

//   socket.on("byegood", (data) => {
//     const p = document.querySelector("#form-server");
//     p.textContent = `${data.who} : ${data.msg}`;
//   });
// }

//[실습3] 채팅장 입장/퇴장 안내 문구
socket.on("notice", (msg) => {
  document
    .querySelector("#chat-list")
    .insertAdjacentHTML("beforeend", `<div class="notice">${msg}</div>`);
});

// [실습3-2]
function entry() {
  socket.emit("setNick", document.querySelector("#nickname").value);
}

socket.on("entrySuccess", (nick) => {
  //1.내 닉네임 설정
  myNick = nick;

  //2.  닉네임 입력창 & 버튼 비 활성화
  document.querySelector("#nickname").disabled = true; //입력창 비활성황 ( 클릭 막기)
  document.querySelector(".entry-box > button").disabled = true; // 버튼 비활성화

  //3. div.chat-box 요소 보이기
  document.querySelector(".chat-box").classList.remove("d-none");
});

// [실습3-2]
//닉네임 중복 -> alert 띄우기
socket.on("error", (msg) => {
  Swal.fire({
    title: msg,
    imageUrl:
      "https://64.media.tumblr.com/e9213f124233ecf031148fa058b9829f/tumblr_obk8bt07AN1r89q2no1_540.gif",
    imageWidth: 400,
    imageHeight: 300,
    imageAlt: "Custom image",
  });
});

//[실습3-2]
//닉네임 리스트 객체 업데이트하는 이벤트를 받음
socket.on("updateNicks", (obj) => {
  let options = `<option value="all">전체</option>`;
  //select#nick-list 요소의 option 추가
  for (let key in obj) {
    //obj[key]: 유저가 인풋에 입력한 닉네임
    //key:소켓 아이디
    options += `<option value="${key}"> ${obj[key]} </option>`;
  }

  //select 요소에 options 덮어쓰기
  document.querySelector("#nick-list").innerHTML = options;
});

socket.on("disconnect", () => {
  console.log("⭕ client socket disonnected>>", socket.id);
});

//[실습4] 채팅창 메세지 전송
//"send" 이벤트 전송 {닉네임, 입력 메세지}
function send() {
  const data = {
    myNick: myNick,
    dm: document.querySelector("#nick-list").value,
    msg: document.querySelector("#message").value,
  };
  socket.emit("send", data);

  document.querySelector("#message").value = ""; //인풋 초기화
}

socket.on("newMessage", (data) => {
  console.log("socket on newMessage>>", data);
  // 채팅 구조
  // <div class="my-chat">
  //         <div>user1: msg1</div>
  //       </div>
  //       <div class="other-chat">
  //         <div>user2: msg2</div>
  //       </div>
  // #chat-list 요소 선택 (파란색 박스 = 메세지 상자)
  let chatList = document.querySelector("#chat-list");

  // .my-chat or .other-chat 요소 생성
  let div = document.createElement("div");

  // 가장 안쪽 div 요소 생성
  let divChat = document.createElement("div");

  //새 메세지가 도착 했는데 , myNick에 저장된  현재 내 닉네임과
  // data의 닉네임이 같다면, 내 채팅으로 보이게 (오른쪽 배치 == .my-chat)
  // data의 닉네임이 다르다면, 상대방 채팅으로 보이게 (왼쪽 배치 == .other-chat)

  //divChat의 textcontent/innerText 값을 적절히 변경
  // div를 chatList에 추가
  if (myNick === data.nick) {
    div.classList.add("my-chat");
  } else {
    div.classList.add("other-chat");
  }

  // [실습5]DM기능 추가
  if (data.dm) {
    //data.dm -> '(속닥속닥)'
    div.classList.add("secret-chat");
    divChat.textContent = data.dm;
  }

  //divChat의 textcontent/innerText 값을 적절히 변경
  //ex. nick : msg 형태로 보이게 했음
  //divChat.textContent = `${data.nick} : ${data.msg}`;//[실습4]
  divChat.textContent = divChat.textContent + `${data.nick} : ${data.msg}`;
  // dm; divChat.textCotent = '(속닥속닥); + 누가 : 메세지
  // not dm; divChat.textcontent =" " + snrk :

  div.append(divChat);
  // div를 chatList에 추가
  chatList.append(div);
  //스크롤 하단 고정
  chatList.scrollTop = chatList.scrollHeight;
});

//
// function out() {
//   socket.emit("setNick", document.querySelector("#nickname").value);
// }
// socket.on("out", (nick) => {
//   document.querySelector(".chat-box").classList.remove("d-none");
// });
