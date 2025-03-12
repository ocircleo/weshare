let uploadBtn = document.getElementById("upload-btn");
let uploadDiv = document.getElementById("upload-div");
let index = 0;
let uploading = 0;
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

(async function () {
  try {
    let location = window.location.href;
    let urlArray = location.split("/");
    let newUrl = urlArray[0] + "//" + urlArray[2];
    let result = await pingFetch(newUrl);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
})();
// window.addEventListener("beforeunload", (e) => beforeUnloadHandler(e));
uploadBtn.addEventListener("change", async (e) => {
  let files = e.target.files;
  let result = await checkConnection();
  if (!result) return (document.getElementById("upload-btn").value = "");
  for (const file of files) {
    let name = file.name,
      size = file.size,
      type = file.type;
    FileUpload(name, size, type, file);
  }
  document.getElementById("upload-btn").value = "";
});

async function FileUpload(name, size, type, file) {
  const xhr = new XMLHttpRequest();
  let progressElement;
  let connectionUrl = sessionStorage.getItem("connectUrl");
  if (!connectionUrl) {
    let result = await checkConnection();
    if (!result) return;
  }
  let user = JSON.parse(sessionStorage.getItem("user"));
  let url = connectionUrl + "/files/file-upload/" + user.id;
  console.log(user, user.id);
  xhr.upload.addEventListener(
    "progress",
    (e) => {
      if (e.lengthComputable) {
        const percentage = Math.round((e.loaded * 100) / e.total);
        progressElement.innerText = percentage.toFixed(1) + "%";
      }
    },
    false
  );

  xhr.upload.addEventListener(
    "load",
    (e) => {
      // 100% uploaded complete
      handelUnloadEvent("decrement");
      progressElement.parentElement.style.backgroundColor =
        "rgb(115, 246, 135)";
      setTimeout(() => {
        progressElement.parentElement.classList.add("hide-from-ui");
      }, 3000);
    },
    false
  );
  xhr.upload.addEventListener("error", (e) => {
    handelUnloadEvent("decrement");
  });
  xhr.upload.addEventListener("timeout", (e) => {
    handelUnloadEvent("decrement");
  });
  xhr.addEventListener("abort", (e) => {
    handelUnloadEvent("decrement");
    progressElement.innerText = "canceled";
    progressElement.classList.add("text-red");
    setTimeout(() => {
      progressElement.parentElement.classList.add("hide-from-ui");
    }, 1500);
  });
  const abort = () => xhr.abort();

  xhr.open("POST", url, true);
  xhr.overrideMimeType(`${type}; x-user-defined-binary`);

  const formData = new FormData();
  formData.append("file", file);
  let progressId = insertFileProgressToUi(name, size, abort);
  progressElement = document.getElementById(progressId);

  xhr.send(formData);
  handelUnloadEvent("increment");
}

function fileSize(size) {
  return size / (1024 * 1024);
}

const insertFileProgressToUi = (name, size, abort) => {
  let fileNameSplit = name.split(".");
  let extension = fileNameSplit[fileNameSplit.length - 1];
  let div = document.createElement("div");
  let p1 = document.createElement("p");
  let p2 = document.createElement("p");
  let p3 = document.createElement("p3");
  let btn = document.createElement("button");
  let id = `progress-${index}`;
  div.className =
    "upload-file-status flex items-center justify-content-between ";
  btn.className = "button";
  p1.innerText = name.slice(0, 12) + "." + extension;
  p2.innerText = fileSize(size).toFixed(2) + "MB";
  p3.innerText = "0%";
  btn.innerText = "Cancel";
  btn.addEventListener("click", (e) => abort());

  p3.setAttribute("id", id);

  div.appendChild(p1);
  div.appendChild(p2);
  div.appendChild(p3);
  div.appendChild(btn);
  uploadDiv.appendChild(div);
  index++;
  return id;
};

//following function is to stop navigating or stop ing the app
let navigationUrl = null;
const beforeUnloadHandler = (event) => {
  // Recommended
  event.preventDefault();

  // Included for legacy support, e.g. Chrome/Edge < 119
  event.returnValue = true;
  if (uploading > 0) {
    Swal.fire({
      title: "Close Page?",
      text: "File upload will be canceled !!",
      showCancelButton: true,
      confirmButtonColor: "#44C662",
      cancelButtonColor: "#F23A3A",
      confirmButtonText: "Yes",
      confirmButtonTextColor: "red",
    }).then((result) => {
      if (result.isConfirmed) {
        uploading = 0;
        window.removeEventListener("beforeunload", beforeUnloadHandler);
        // If a navigation URL was captured, navigate to it
        if (navigationUrl) {
          window.location.href = navigationUrl;
        } else {
          // If it's a refresh, allow the page to reload
          location.reload();
        }
      }
    });
  } else {
    if (navigationUrl) {
      window.location.href = navigationUrl;
    } else {
      // If it's a refresh, allow the page to reload
      location.reload();
    }
  }
};

//function for manageing the state of unloadHandler
const handelUnloadEvent = (type) => {
  if (type == "increment") {
    if (uploading <= 0) {
      uploading = 1;
      window.addEventListener("beforeunload", beforeUnloadHandler);
    } else uploading++;
    return;
  }

  if (uploading <= 1) {
    uploading = 0;
    window.removeEventListener("beforeunload", beforeUnloadHandler);
  } else uploading--;
};

document.addEventListener("click", (event) => {
  const link = event.target.closest("a"); // Find the clicked link
  if (link && link.href) {
    event.preventDefault(); // Stop immediate navigation
    navigationUrl = link.href; // Store the intended URL
    beforeUnloadHandler(event); // Trigger confirmation
  }
});

async function checkConnection() {
  let result = await ping();
  if (!result) Toast.fire({ icon: "error", title: "Not connected" });
  return result;
}
