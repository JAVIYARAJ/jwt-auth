async function validateUser(email){
    
    const user_error=document.getElementById("user_error");
    const auth_btn=document.getElementById("register-btn");

    const response=await fetch(`/checkUser/?email=${email}`);
    const data=await response.json();
    const status=data.status;
    if(status!=true){
        auth_btn.style.display='none';
        user_error.innerHTML="Email already exists";
    }else{
        user_error.innerHTML="";
        auth_btn.style.display='block';
    }
}