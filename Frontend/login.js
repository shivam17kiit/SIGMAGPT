async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const response =
        await fetch(
            "https://localhost:8080/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

   const data =
await response.json();

localStorage.setItem(
    "token",
    data.token
);

alert("Login Successful");
window.location.href =
"http://localhost:5173";

}