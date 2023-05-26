// [before]
// const Visitor = require('../model/Visitor');
// [after]
// models 변수 값 = models/index.js에서 export 한 db 객체
const models = require("../models"); // models/index.js 내보내는 값

// (1) GET / => localhost:PORT/
exports.main = (req, res) => {
  res.render("index");
};

// (2) GET /visitor => localhost:PORT/visitor
exports.getVisitors = (req, res) => {
  // [bofore] mysql db 연결!
  // Visitor.getVisitors((result) => {
  //   console.log('Cvisitor.js >>', result);
  //
  //   res.render('visitor', { data: result });
  // });
  // => SELECT * FROM visitor;

  // [after] sequelize
  models.Visitor.findAll().then((result) => {
    console.log("findAll >> ", result);
    res.render("visitor", { data: result });
  });
};

// (3) POST /visitor/write
exports.postVisitor = async (req, res) => {
  //before code
  // console.log(req.body);

  // Visitor.postVisitor(req.body, (result) => {
  //   console.log("Cvisitor.js >>", result); // model 코드에서 데이터를 추가한 결과인 rows.insertId
  //   res.send({ id: result, name: req.body.name, comment: req.body.comment });
  // });

  // after code
  const result = await models.Visitor.create({
    name: req.body.name,
    comment: req.body.comment,
  });
  console.log("create >>", result);

  res.send(result);
};

// (5) DELETE /visitor/delete
exports.deleteVisitor = async (req, res) => {
  //before code
  // console.log(req.body); // { id: n }
  // Visitor.deleteVisitor(req.body.id, (result) => {
  //   console.log("Cvisitor.js >> ", result);
  //   res.send("삭제 성공!!");
  // });

  //after code
  await models.Visitor.destroy({
    where: { id: req.body.id },
  });
  res.end();
};

exports.getVisitor = async (req, res) => {
  //before code
  // console.log("*", req.query); // { id: n }
  // Visitor.getVisitor(req.query.id, (result) => {
  //   console.log("**", result); // model callback에서 넘겨주는 rows[0] => {}
  //   res.send(result);
  // });

  //after code
  const result = await models.Visitor.findOne({
    where: { id: req.query.id },
  });
  console.log("findOne>>", result);
  res.send(result);
};

exports.patchVisitor = async (req, res) => {
  //before conde
  // console.log(req.body);
  // Visitor.patchVisitor(req.body, () => {
  //   res.send("수정 성공!");
  // });

  //after code
  const result = await models.Visitor.update(
    {
      name: req.body.name,
      comment: req.body.comment,
    },
    {
      where: {
        id: req.body.id,
      },
    }
  );
  console.log("update>>", result);
  res.end();
  //res.send("수정완료"); // 문자 띄우기
};
