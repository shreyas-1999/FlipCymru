$(function () {
    $("#loginForm").submit(function (e) {
      e.preventDefault();
      const email = $("#email").val();
      const password = $("#password").val();
  
      $.ajax({
        url: "http://localhost:5000/api/auth/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ email, password }),
        success: function (res) {
          localStorage.setItem("token", res.access_token);
          localStorage.setItem("username", res.name);
          window.location.href = "home.html";
        },
        error: function () {
          alert("Login failed");
        },
      });
    });
  
    $("#registerForm").submit(function (e) {
      e.preventDefault();
      const email = $("#email").val();
      const password = $("#password").val();
      const name = $("#name").val();
    
      $.ajax({
        url: "http://localhost:5000/api/auth/register",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ email, password, name }),
        success: function (res) {
          localStorage.setItem("token", res.access_token);
          localStorage.setItem("username", name);
          window.location.href = "home.html";
        },
        error: function () {
          alert("Registration failed");
        },
      });
    });
  
    $("#googleLoginBtn").click(function () {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).then(async (result) => {
        const email = result.user.email;
        const name = result.user.displayName;
    
        const res = await fetch("http://localhost:5000/api/auth/google-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, name }),
        });
    
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("username", data.name);
          window.location.href = "home.html";
        } else {
          alert("Google login failed.");
        }
      }).catch(() => {
        alert("Google login failed.");
      });
    });    
  });
  