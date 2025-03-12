const Toast = Swal.mixin({
  toast: true,
  position: "bottom-start",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

let serverUser = JSON.parse(sessionStorage.getItem("user"));
let serverAddress = JSON.parse(sessionStorage.getItem("serverAddress"));
async function connectedServer() {
  const result = await ping();
  if (!result) return diagnosingServer();

  let connectionContainer = document.getElementById("connection-container");
  serverAddress = JSON.parse(sessionStorage.getItem("serverAddress"));
  serverAddress?.ip?.forEach((ele, index) => {
    let addressText = ele.address;

    let address = addressText.split(".");
    console.log(ele.address);
    connectionContainer.innerHTML += `
    <div class="connection-div-container">
   <div
          class="connection-div flex flex-col-sm justify-content-between items-center ${
            index % 2 == 0 ? "bg-ui-green" : "bg-ui-blue"
          }"
        >
          <div class="flex">
            <div class="flex flex-col justify-between">
              <p class="connection-sub-title">IP Address (${ele.name})</p>
              <div class="flex items-center">
                <input
                  class="connection-ip-part"
                  id="ipv1"
                  placeholder="192"
                  value=${address[0]}
                  disabled
                />
                <p class="font-bold">.</p>
                <input
                  class="connection-ip-part"
                  id="ipv2"
                  placeholder="168"
                  value=${address[1]}
                  disabled
                />
                <p class="font-bold">.</p>
                <input
                  class="connection-ip-part"
                  id="ipv3"
                  placeholder="0"
                  value=${address[2]}
                  disabled
                />
                <p class="font-bold">.</p>
                <input
                  class="connection-ip-part"
                  id="ipv4"
                  placeholder="101"
                  value=${address[3]}
                  disabled
                />
                <p class="font-bold">:</p>
              </div>
            </div>
            <div class="flex flex-col justify-between">
              <p class="connection-sub-title">Port</p>
              <div>
                <input
                  class="connection-ip-part"
                  id="ipPort"
                  placeholder="000"
                  value=${serverAddress?.port}
                  disabled
                />
              </div>
            </div>
          </div>

          <div id="copy-${index}">
          </div>
          </div>
          <p class="text-base">Qr Code ( ${ele.name} ) | Scan to connect to this network</P>
          <div id="${ele.address}"></div>

          </div>
`;
    let id = `${ele.address}`;
    let url = `http://${ele.address}:${serverAddress?.port}/files`;
    setTimeout(() => {
      insertQrCode(id, url);
    }, 300);
  });
  function insertQrCode(id, url) {
    let qrcode = new QRCode(id, {
      text: url,
      width: 120,
      height: 120,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
  setTimeout(() => {
    serverAddress?.ip?.forEach((ele, index) => {
      let div = document.getElementById("copy-" + index);
      let button = document.createElement("button");
      button.innerText = "Copy";
      button.type = "button";
      button.addEventListener("click", (e) => {
        copyText(`http://${ele.address}:${serverAddress?.port}`);
      });
      div.appendChild(button);
    });
  }, 200);
}
connectedServer();
function copyText(text) {
  navigator.clipboard.writeText(text);
}
let alreadyCheckedServer = false;
async function diagnosingServer() {
  if (alreadyCheckedServer)
    return Toast.fire({ icon: "error", title: "Starting server failed" });
  Toast.fire({ icon: "error", title: "Diagnosing server" });
  let result = await window.server.start();
  if (!result.error) {
    let user = result.user;
    sessionStorage.setItem("serverAddress", JSON.stringify(result.data));
    sessionStorage.setItem("user", JSON.stringify(user));

    setTimeout(() => {
      alreadyCheckedServer = true;
      connectedServer();
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
}
