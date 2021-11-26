const express = require("express");
const router = express.Router();

const path = require("path");

router.get("/upload/images/:path", (req, res,next) => {
   
   res.sendFile(path.join(__dirname,"../upload/images/" + req.params.path));
   
  
});



module.exports = router;
