const path = require("path");
const Koa = require("koa");
const Router = require("@koa/router");
const multer = require("@koa/multer");
const cors = require("@koa/cors");
const fs = require("fs");
const NodeRSA = require('node-rsa');
const key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n'+
                      'MIIBOQIBAAJAVY6quuzCwyOWzymJ7C4zXjeV/232wt2ZgJZ1kHzjI73wnhQ3WQcL\n'+
                      'DFCSoi2lPUW8/zspk0qWvPdtp6Jg5Lu7hwIDAQABAkBEws9mQahZ6r1mq2zEm3D/\n'+
                      'VM9BpV//xtd6p/G+eRCYBT2qshGx42ucdgZCYJptFoW+HEx/jtzWe74yK6jGIkWJ\n'+
                      'AiEAoNAMsPqwWwTyjDZCo9iKvfIQvd3MWnmtFmjiHoPtjx0CIQCIMypAEEkZuQUi\n'+
                      'pMoreJrOlLJWdc0bfhzNAJjxsTv/8wIgQG0ZqI3GubBxu9rBOAM5EoA4VNjXVigJ\n'+
                      'QEEk1jTkp8ECIQCHhsoq90mWM/p9L5cQzLDWkTYoPI49Ji+Iemi2T5MRqwIgQl07\n'+
                      'Es+KCn25OKXR/FJ5fu6A6A+MptABL3r8SEjlpLc=\n'+
                      '-----END RSA PRIVATE KEY-----');
const app = new Koa();
const router = new Router();

const PORT = 3000;

const upload = multer();

router.get("/", async (ctx) => {
  ctx.body = "Hello friends!";
});


router.post("/upload-single-file", upload.single("file"), (ctx) => {
  console.log("ctx.request.file", ctx.request.file);

  let file = ctx.request.file;
  let buff = new Buffer(file.buffer);
  let filetext = buff.toString('utf8');
  console.log('"' + buff + '" converted to Base64 is "' + filetext + '"');


  const encrypted = key.encrypt(filetext, 'base64');

  let filename = `${new Date().getTime()}`;
  if (file.originalname.includes(`.`)) {
    filename += `.${file.originalname.split(`.`)[file.originalname.split(`.`).length-1]}`;
  }
  fs.writeFile(`files/${filename}`, encrypted, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
  });

  ctx.status = 200;
  ctx.body = filename;
});

app.use(cors());
app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`app starting at port ${PORT}`);
});

router.get('/getfile/:filename', async function(ctx) {
  const filename = `${__dirname}/files/${ctx.params.filename}`;
  const d_filename = `${__dirname}/files/d${ctx.params.filename}`;
  try {
    if (fs.existsSync(filename)) {
      const data = fs.readFileSync(filename, {encoding:'utf8', flag:'r'});
      const decrypted = key.decrypt(data, 'utf8');
      fs.writeFile(d_filename, decrypted, function(err) {
        if(err) {
            return console.log(err);
        }
      });
      ctx.body = fs.createReadStream(d_filename);
      ctx.attachment(d_filename);
    } else {
      ctx.throw(400, "Requested file not found on server");
    }
  } catch(error) {
    ctx.throw(500, error);
  }  
});

