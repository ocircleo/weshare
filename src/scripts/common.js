let connectionDomAnchor = document.getElementById("connection");
let temUser = sessionStorage.getItem("user");
temUser = JSON.parse(temUser);
if (temUser?.role == "server") {
  connectionDomAnchor.setAttribute("href", "./server.html");
  connectionDomAnchor.innerText = "Server";
}
// window.addEventListener("keyup", (e) => {
//   console.log(e.key);
// });
document.getElementById("reload").addEventListener("click", (e) => {
  window.location.reload();
});
