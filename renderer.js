sessionStorage.removeItem("serverAddress");

window.server.stop();
let startBtn = document.getElementById("startServer");
startBtn.addEventListener("click", async (e) => {
  let result = await window.server.start();
  if (!result.error) {
    let user = result.user;
    sessionStorage.setItem("serverAddress", JSON.stringify(result.data));
    sessionStorage.setItem("user", JSON.stringify(user));

    setTimeout(() => {
      window.location.href = "./src/pages/server.html";
    }, 300);
  } else {
    sessionStorage.clear();
    Swal.fire({
      icon: "error",
      title: "Error...",
      text: "Failed to Start Server",
      confirmButtonColor: "#44C662",
      confirmButtonText: "Ok",
    });
  }
});
