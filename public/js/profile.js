//console.log(profileUserId);
var cropper;

$(document).ready( async() => {
  
  const payload = await axios.get(`/user`);
  const UserId = payload.data.userid;
  if(profileUserId == UserId)
  {
    $('#followButton').remove();
    $('#userImageContainer').append(`<button type="button" data-bs-toggle="modal" data-bs-target="#picModal" class="imageUploadButton"><i class="fas fa-camera"></i></button>`)
    $('#coverPhotoContainer').append(`<button type="button" data-bs-toggle="modal" data-bs-target="#coverModal" class="coverUploadButton"><i class="fas fa-camera"></i></button>`)
  }
  $("#Profile").attr("src",profilePic);
  $("#Cover").attr("src",coverPic);
  loadPosts();
  //console.log(payload.data.user.following);
  if(payload.data.user.following && payload.data.user.following.includes(profileUserId))
  {
     $("#followText").text("Unfollow");
  }
  {
     $("#followText").text("Follow");
     
  }
})

async function loadPosts(){
  const posts = await axios.get('/api/post',{params:{postedBy:profileUserId}});
  //console.log(posts);
  //console.log(profileUserId);
  const payload = await axios.get(`/user`);
  const UserId = payload.data.userid
  for (let post of posts.data) {
      // $('.postsContainer').append(`<li>${post.content} by ${post.postedBy} </li>`);
       const html = createPostHtml(post,UserId)
       $(".userPostsContainer").prepend(html);
       
   }
}
$('.userPostsContainer').on('click','.likeButton',async(event)=>{
  
  const button = $(event.target);
  const postId = getPostIdFromElement(button);
  const postData=await axios.patch(`/api/posts/${postId}/like`);
  await button.find("span").text(postData.data.likes.length || "");
 //console.log(postData);
 
})
$('#followButton').click(async() => {
  const button = $(event.target);
  const payload = await axios.get(`/user`);
  const UserId = payload.data.userid
  //console.log(UserId);
  const resp= await axios.post(`/user/${profileUserId}/follow`);
  console.log(resp.data.followers.length);
  $('#followersValue').text(resp.data.followers.length);
  $('#followingValue').text(resp.data.following.length);
  if(resp.data.followers && resp.data.followers.includes(UserId))
  {
    $("#followText").text("Unfollow");
  }
  else{
    $("#followText").text("Follow");
  }
});

$('#filePhoto').change(function()
{
    if(this.files[0])
    {
        var reader = new FileReader();
        reader.onload = (e) => {
          var image = document.getElementById("imagePreviewContainer")
          image.src = e.target.result;
          //  $("#imagePreviewContainer").attr("src",e.target.result)
            if(cropper !== undefined)
            {
              cropper.destroy();
            }
            cropper = new Cropper(image,{
              aspectRatio:1/1,
              dragMode:'crop',
              cropBoxMovable:true,
              movable: true,
            })
           
        }
        reader.readAsDataURL(this.files[0]);
    }
    else
    {
      console.log("nope");
    }
   
   
});
$('#coverPhoto').change(function()
{
    if(this.files[0])
    {
        var reader = new FileReader();
        reader.onload = (e) => {
          var image = document.getElementById("coverPreviewContainer")
          image.src = e.target.result;
          //  $("#imagePreviewContainer").attr("src",e.target.result)
            if(cropper !== undefined)
            {
              cropper.destroy();
            }
            cropper = new Cropper(image,{
              aspectRatio:16/9,
              dragMode:'crop',
              cropBoxMovable:true,
              movable: true,
            })
           
        }
        reader.readAsDataURL(this.files[0]);
    }
    else
    {
      console.log("nope");
    }
   
   
});
$('#imgUploadButton').click(() => {
    
    var canvas = cropper.getCroppedCanvas();
    if(canvas==null)
    {
      alert("Could not open the image.Make sure it is image file");
      return ;
    }
    canvas.toBlob((blob) => {
      var formData = new FormData();
      formData.append("croppedImage",blob);
      //console.log(formData);
      $.ajax({
        url:"/user/profilepicture",
        type:"POST",
        data:formData,
        processData:false,
        contentType:false,
        success: location.reload()
      })
    });  
   
})
$('#coverUploadButton').click(() => {
    
  var canvas = cropper.getCroppedCanvas();
  if(canvas==null)
  {
    alert("Could not open the image.Make sure it is image file");
    return ;
  }
  canvas.toBlob((blob) => {
    var formData = new FormData();
    formData.append("croppedImage",blob);
    //console.log(formData);
    $.ajax({
      url:"/user/coverpicture",
      type:"POST",
      data:formData,
      processData:false,
      contentType:false,
      success: location.reload()
    })
  });  
 
})