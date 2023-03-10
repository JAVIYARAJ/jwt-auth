const auth_btn = document.getElementById("register-btn");
const password_error = document.getElementById("pwd_error");
const cPassword_error = document.getElementById("confirm_pwd_error");
const user_error = document.getElementById("user_error");
auth_btn.style.display = 'none';

async function validateUser(email) {

    const response = await fetch(`/checkUser/?email=${email}`);
    const data = await response.json();
    const status = data.status;

    if (status != true) {
        auth_btn.style.display = 'none';
        user_error.innerHTML = "Email already exists";
    } else {
        user_error.innerHTML = "";
        auth_btn.style.display = 'block';
    }
}

async function validatePassword(password, type) {

    if (password.length < 7) {
        if (type == 'pwd') {
            auth_btn.style.display = 'none';
            password_error.innerHTML = "At Least 7 character are required!"
        } else if (type == 'cpwd') {
            auth_btn.style.display = 'block';
            cPassword_error.innerHTML = "At Least 7 character are required!"
        }
    } else {
        if (type == 'pwd') {
            auth_btn.style.display = 'none';
            password_error.innerHTML = ""
        } else if (type == 'cpwd') {
            auth_btn.style.display = 'block';
            cPassword_error.innerHTML = ""
        }
    }

}
