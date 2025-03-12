let connectionForm = document.getElementById("connection-form");
let connectionTitle = document.getElementById("connection-title");
(async function () {
  let result = await ping();

  if (result) {
    let connectUrl = sessionStorage.getItem("connectUrl");
    let url = sessionStorage.getItem("connectUrl");
    let ipv1 = document.getElementById("ipv1");
    let ipv2 = document.getElementById("ipv2");
    let ipv3 = document.getElementById("ipv3");
    let ipv4 = document.getElementById("ipv4");
    let ipPort = document.getElementById("ipPort");

    let urlArray = url.split("//");
    let [Ip, port] = urlArray[1].split(":");
    let [ip1, ip2, ip3, ip4] = Ip.split(".");
    ipv1.value = ip1;
    ipv2.value = ip2;
    ipv3.value = ip3;
    ipv4.value = ip4;
    ipPort.value = port;

    connectionForm.classList.remove("bg-ui-gray");
    connectionForm.classList.add("bg-ui-green");
    connectionTitle.innerText = "You Are Connected: ";
    let user = JSON.parse(sessionStorage.getItem("user"));
    if (user) {
      document.getElementById("connection-info").innerText =
        "Device Name: " + user.name;
    }
    document.getElementById("qr-code").innerHTML = "";
    insertQrCode(connectUrl);
  }
})();

connectionForm.addEventListener("submit", async (e) => {
  let url = "http://";
  e.preventDefault();
  let target = e.target;
  let ipv1, ipv2, ipv3, ipv4, port;
  ipv1 = target.ipv1.value;
  ipv2 = target.ipv2.value;
  ipv3 = target.ipv3.value;
  ipv4 = target.ipv4.value;
  port = target.ipPort.value;
  url += ipv1 + "." + ipv2 + "." + ipv3 + "." + ipv4 + ":" + port;

  //next step ping to server then set the session storage url and change ui state;
  sessionStorage.setItem("connectUrl", url);
  let pingUrl = url + "/ping";
  let result = await ping(pingUrl);
  if (result.error) {
    connectionForm.classList.remove("bg-ui-gray");
    connectionForm.classList.remove("bg-ui-green");
    connectionForm.classList.add("bg-ui-gray");
    connectionTitle.innerText = "You Are Not Connected: ";
  } else {
    connectionForm.classList.remove("bg-ui-gray");
    connectionForm.classList.remove("bg-ui-green");
    connectionForm.classList.add("bg-ui-green");
    connectionTitle.innerText = "You Are Connected: ";
    document.getElementById("qr-code").innerHTML = "";
    insertQrCode(url);
  }
});
function insertQrCode(url) {
  let qrcode = new QRCode("qr-code", {
    text: url,
    width: 120,
    height: 120,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
}
