
async function refreshTweets() 
{
  $('.postsContainer').empty();
  const posts = await axios.get('/api/post');
  const payload = await axios.get(`/user`);
  UserId = payload.data.userid
  for (let post of posts.data) 
  {
     // $('.postsContainer').append(`<li>${post.content} by ${post.postedBy} </li>`);
      const html = createPostHtml(post,UserId)
      $(".postsContainer").prepend(html);
      
  }
  /*
  const payload = await axios.get(`/user`);
  UserId = payload.data.userid;
  console.log(UserId)*/
}

refreshTweets();

$('#submitPostButton').click(async() => {
  const postText = $('#post-text').val();
  console.log(postText);
  await axios.post('/api/post', {content:postText });
  $('#post-text').val("");
  refreshTweets();
});

$('#replyModal').on('show.bs.modal', async (event) => 
{
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $('#submitReplyButton').attr('data-id', postId);
  //console.log($('#submitReplyButton').data("id"))
  const postData = await axios.get(`/api/posts/${postId}`);
  //console.log(postData);
  const html = createPostHtml(postData.data);
  //console.log(html);
  $('#originalPostContainer').empty();
  $('#originalPostContainer').append(html);
})

$('#submitReplyButton').click(async() => {
  //console.log("clicked");
  const element = $(event.target);
  const postText = $('#reply-text-container').val();
  const replyTo = element.attr('data-id');
  //console.log(postText);
  //console.log(replyTo);
  const postData = await axios.post('/api/post',{content:postText,replyTo:replyTo});
  location.reload();
})
$('#delModal').on('show.bs.modal', async (event) => 
{
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  
  $('#delButton').attr('data-id', postId);
  //console.log($('#delButton').data("id"))
  //await axios.get(`/api/posts/${postId}`);
  
  
})
$('#delButton').click(async() => {
  var postid = $(delButton).data("id");
  //console.log(postid);
  const postData=await axios.delete(`/delete/${postid}`);
  location.reload();

});
function createPostHtml(postData,UserId) {
  
  const postedBy = postData.postedBy;
  // console.log(postedBy);
  
  if(postedBy._id === undefined) {
      return console.log("User object not populated");
  }

  const displayName = postedBy.firstName + " " + postedBy.lastName;
  const timestamp = timeDifference(new Date(),new Date(postData.createdAt));
  //const replyTo = postData.replyTo ? `replying to ${displayName}`:"";
  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) 
  {
       if (!postData.replyTo._id) 
       {
            return alert("Reply to is not populated");
       } 
       else if (!postData.replyTo.postedBy._id) 
       {
             return alert("Posted by is not populated");
       }

       const replyToUsername = postData.replyTo.postedBy.username;
       replyFlag = `<div class='replyFlag'>Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}<a></div>`;
}
   var buttons = ""
   if(postedBy._id == UserId) {
     //buttons = `<button data-id="${postData._id}" data-toggle="modal" data-target="delModal" class="delicon" ><i class="fa fa-close" ></i></button>`;
     buttons = `<button data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#delModal" class="delicon" ><i class="fa fa-close" ></i></button>`;
   }
  return `<div class='post' data-id='${postData._id}'>

              <div class='mainContentContainer'>
                  <div class='userImageContainer'>
                      <img src='${postedBy.profilePic}'>
                  </div>
                  <div class='postContentContainer'>
                      <div class='header'>
                          <a href='/profile/${postedBy.username}' class='displayName'>${displayName}</a>
                          <span class='username'>&nbsp&nbsp@${postedBy.username}</span>
                          
                          <span class='date'>&nbsp ${timestamp}</span>
                          ${buttons}
                      </div>
                      <div style="color:var(--twitter-heading)">${replyFlag}</div>
                      <div class='postBody'>
                          <span>${postData.content}</span>
                      </div>
                      <div class='postFooter'>
                          <div class='postButtonContainer'>
                          <button type="button" data-bs-toggle="modal" data-bs-target="#replyModal">
                          <i class='far fa-comment'></i>
                      </button>
                          </div>
                          <div class='postButtonContainer green'>
                             
                          </div>
                          <div class='postButtonContainer red'>
                              <button class='likeButton' id='likebutton'>
                                  <i class='far fa-heart'></i>
                                  <span>${postData.likes.length || "" }</span>
                              </button>
                          </div>
                      </div>
                      
                  </div>
              </div>
          </div>`;
}
function getPostIdFromElement(element)
{
  const isRoot = element.hasClass('post');
  const rootElement = isRoot ===true ? element:element.closest('.post');
  const postId = rootElement.data().id;
  return postId;
}

$('.postsContainer').on('click','.likeButton',async(event)=>{
  
  const button = $(event.target);
  const postId = getPostIdFromElement(button);
  const postData=await axios.patch(`/api/posts/${postId}/like`);
  await button.find("span").text(postData.data.likes.length || "");
 //console.log(postData);
 
})


function timeDifference(current, previous) {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {

      if(elapsed/1000 < 30){

          return "Just now";
      }

       return Math.round(elapsed/1000) + ' seconds ago';   
  }

  else if (elapsed < msPerHour) {
       return Math.round(elapsed/msPerMinute) + ' minutes ago';   
  }

  else if (elapsed < msPerDay ) {
       return Math.round(elapsed/msPerHour ) + ' hours ago';   
  }

  else if (elapsed < msPerMonth) {
      return Math.round(elapsed/msPerDay) + ' days ago';   
  }

  else if (elapsed < msPerYear) {
      return Math.round(elapsed/msPerMonth) + ' months ago';   
  }

  else {
      return Math.round(elapsed/msPerYear ) + ' years ago';   
  }
}
