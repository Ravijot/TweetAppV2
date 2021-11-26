const express = require("express");
const router = express.Router();
const Post = require("../models/posts");
const { isLoggedIn } = require("../middleware");
const User = require("../models/user");
const multer = require("multer")
const upload = multer({dest:"upload/images"})
const path = require("path");
const fs = require("fs");
router.get("/profile", isLoggedIn, (req, res) => {
  const payload = {
    user: req.user,
    displayName: req.user.firstName + " " + req.user.lastName,
  };

  res.render("profilePage", { payload });
});

router.get("/profile/:username", isLoggedIn, async (req, res) => {
  const user = await User.findOne({ username: req.params.username });

  const payload = {
    user: user,
    displayName: user.firstName + " " + user.lastName,
  };

  res.render("profilePage", { payload });
});
/*router.get('/follow/:userId/:profId',async(req,res) => {
  const {userId,profId} = req.params;
  // push profileId into current user's following array
  const currentUser = await User.findById(userId);
  const profUser = await User.findById(profId);
  
  currentUser.following.push(profUser);
  profUser.followers.push(currentUser);
  await currentUser.save();
  await profUser.save();
  //res.status(200).json({currentUser,profUser});
  res.redirect(`/profile/${profUser.username}`);
});*/

router.post('/follow', async (req, res, next) => {
 
  const currentUser = req.body.current;
  const profUser = req.body.prof;
  const action = req.body.action;

  console.log(currentUser,profUser,action);

  try {
      switch(action) {
          case 'follow':
              await Promise.all([ 
                  User.findByIdAndUpdate(profUser, {$addToSet : { following: currentUser }}),
                  User.findByIdAndUpdate(currentUser, { $addToSet: { followers: profUser }})
                 
              
              ]);
          break;

          case 'unfollow':
              await Promise.all([ 
                  User.findByIdAndUpdate(profUser, { $pull: { following: currentUser }}),
                  User.findByIdAndUpdate(currentUser, { $pull: { followers: profUser }}),
                 
              ]); 
          break;

          default:
              break;
      }

     
      
  } catch(err) {
      res.json({ done: false });
  }
  
 
});
router.post('/user/:profileuserId/follow', async (req, res, next) => {
     const UserId =req.user._id;
     const ProfileUserId = req.params.profileuserId;
     //console.log(currentUser);
     var user = await User.findById(UserId);
     var profuser = await User.findById(ProfileUserId);
     if(user == null)
     {
       return res.sendStatus(404);
     }
     var isFollowing = profuser.followers && profuser.followers.includes(req.user._id);
     
     var option = isFollowing ? "$pull" : "$addToSet";
     //console.log(option);
     req.user = await User.findByIdAndUpdate(
      req.user._id,
      { [option]: { following: ProfileUserId } },
      { new: true }
    ).catch(error =>{
      console.log(error);
      res.sendStatus(400);
    });
    req.user = await User.findByIdAndUpdate(
      ProfileUserId,
      { [option]: { followers: req.user._id } }
     
    ).catch(error =>{
      console.log(error);
      res.sendStatus(400);
    });
    var profuser = await User.findById(ProfileUserId);
     res.status(200).send(profuser);
});

router.post('/user/profilepicture',upload.single("croppedImage"), async (req, res, next) => {
    
  if(!req.file ){
        console.log("No file Uploaded with Ajax");
        return res.sendStatus(400);
      }

      var filePath = `/upload/images/${req.file.filename}`;
      var tempPath = req.file.path;
      var targetPath = path.join(__dirname,`../../${filePath}`);
      /*fs.rename(tempPath,targetPath,error => {
        if(error != null)
        {
          console.log(error);
          return res.sendStatus(400);
        }
        res.sendStatus(200);
      })*/
      req.session.user = await User.findByIdAndUpdate(req.user._id,{profilePic:filePath},{new:true});
     
      res.sendStatus(204);
})
router.post('/user/coverpicture',upload.single("croppedImage"), async (req, res, next) => {
    
  if(!req.file ){
        console.log("No file Uploaded with Ajax");
        return res.sendStatus(400);
      }

      var filePath = `/upload/images/${req.file.filename}`;
      var tempPath = req.file.path;
      var targetPath = path.join(__dirname,`../../${filePath}`);
      /*fs.rename(tempPath,targetPath,error => {
        if(error != null)
        {
          console.log(error);
          return res.sendStatus(400);
        }
        res.sendStatus(200);
      })*/
      req.session.user = await User.findByIdAndUpdate(req.user._id,{coverPhoto:filePath},{new:true});
     
      res.sendStatus(204);
})
module.exports = router;
