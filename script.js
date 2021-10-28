console.log("Script is working");

function createAccount() {
  console.log("hello");
  axios
    .get("http://localhost:3000/createAccount")
    .then((data) => {
      console.log(data.data.id);
      sessionStorage.setItem("id", data.data.id);
      sessionStorage.setItem("key", data.data.key);
      //   localStorage.setItem("id", res.data);
    })
    .catch((err) => {
      console.log(err);
    });
}

function transferMoney() {
  console.log(sessionStorage.getItem("id"));
  const id = sessionStorage.getItem("id");
  const key = sessionStorage.getItem("key");
  console.log(id);
  console.log("hello1");
  axios.post(`http://localhost:3000/transferMoney/${id}/${key}`);
}

document.getElementById("btn").addEventListener("click", createAccount);
document.getElementById("transfer").addEventListener("click", transferMoney);
