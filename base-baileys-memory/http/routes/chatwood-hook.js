const express = require("express");
const { createReadStream } = require("fs");
const { join } = require("path");
const router = express.Router();
/* Router
 * @param {*} req
 * @param {*} res
 */
const chatWoodHook = async (req, res) => {
  const providerWs = req.providerWs
  /* console.log(providerWs) */
  /* console.log(res) */
  console.log(req.body)
  const body = req.body;
  if(body?.private){
    res.send(null)
    return
  }
  const phone = body?.conversation?.meta?.sender?.phone_number.replace('+','')
  console.log(phone)
  await providerWs.sendText(`${phone}@c.us`, body.content)
  res.send(body);
};
/* Controller */
router.post("/chatwood-hook", chatWoodHook);
/* OTRA RUTA */
router.get("/get-qr", async (_, res) => {
  const YOUR_PATH_QR = join(process.cwd(), `bot.qr.png`);
  const fileStream = createReadStream(YOUR_PATH_QR);
  res.writeHead(200, { "Content-Type": "image/png" });
  fileStream.pipe(res);
});

module.exports = router;
