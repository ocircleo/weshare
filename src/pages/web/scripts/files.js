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
  } finally {
    fetchFiles();
  }
})();
async function checkConnection() {
  let result = await ping();
  if (result) return true;
  else Toast.fire({ icon: "error", title: "Not connected" });
}
const fetchFiles = async () => {
  let result = await checkConnection();
  if (!result) return noFilesFound();
  let connectionUrl = sessionStorage.getItem("connectUrl");
  let req = await fetch(connectionUrl + "/files/all-files");
  let res = await req.json();
  if (res?.files) manageFileData(res?.files ?? []);
};

const manageFileData = (array) => {
  if (array.length == 0) return noFilesFound();
  let sortedArray = sortArray(array);
  if (sortedArray.length == 0) noFilesFound();
  else document.getElementById("file-div").innerHTML = "";
  for (let ele in sortedArray) {
    insertFileToUi(sortedArray[ele]);
  }
};
const noFilesFound = () => {
  let fileDiv = document.getElementById("file-div");

  fileDiv.innerHTML = `<p class="text-ui-gray text-lg no-files-found font-semibold">
        No Files found
      </p>`;
};
function fileSize(size) {
  return size / (1024 * 1024);
}

//makes plane array of objects to an object of array for showing all files from the same user in a row
function sortArray(array) {
  //[{id:1,data:34},{id:2,data:4},{id:1,data:34}]
  let sortObj = {};
  array.forEach((ele) => {
    if (sortObj[ele.userId]) {
      sortObj[ele.userId].urlNames.push({
        fileOriginalName: ele.fileOriginalName,
        fileNewName: ele.fileNewName,
        size: ele.size,
      });
    } else {
      sortObj[ele.userId] = {
        name: ele.userName,
        urlNames: [
          {
            fileOriginalName: ele.fileOriginalName,
            fileNewName: ele.fileNewName,
            size: ele.size,
          },
        ],
      };
    }
  });
  return sortObj;
}
const insertFileToUi = (fileObj) => {
  let filesDiv = document.getElementById("file-div");
  let fileArr = fileObj.urlNames;
  let uploaderName = fileObj.name;

  let containerDiv = document.createElement("div");
  let UploaderNameP = document.createElement("p");
  containerDiv.className = "single-fileList flex flex-col gap-10";
  UploaderNameP.innerText = "User: " + uploaderName;
  containerDiv.appendChild(UploaderNameP);

  fileArr.map((ele) => {
    let div = document.createElement("div");
    let p1 = document.createElement("p");
    let p2 = document.createElement("p");
    let a = document.createElement("a");
    let p3 = document.createElement("p");

    div.className = "file-card flex items-center justify-content-between";
    let fileNameSplit = ele.fileOriginalName.split(".");
    let extension = fileNameSplit[fileNameSplit.length - 1];

    p1.innerText = ele.fileOriginalName.slice(0, 15) + "." + extension;
    p2.innerText = fileSize(ele.size).toFixed(2) + "MB";
    a.innerText = "Download";
    a.style.cursor = "pointer";
    a.className = "link";

    let connectionUrl = sessionStorage.getItem("connectUrl");
    let port = JSON.parse(sessionStorage.getItem("port"));
    let downUrl =
      "http://127.0.0.1:" + port?.port + "/files/download/" + ele.fileNewName;

    if (connectionUrl)
      downUrl = connectionUrl + "/files/download/" + ele.fileNewName;

    p3.setAttribute("id", ele.fileNewName);
    a.setAttribute("href", downUrl);
    a.setAttribute("downloadUrl", true);
    a.setAttribute("download", true);
    //   a.addEventListener("click", (e) => {
    //     e.preventDefault();
    //     downloadFile(downUrl, ele.fileOriginalName, ele.fileNewName);
    //   });

    div.appendChild(p1);
    div.appendChild(p2);
    div.appendChild(p3);
    div.appendChild(a);
    containerDiv.appendChild(div);
    filesDiv.appendChild(containerDiv);
  });
};

async function downloadFile(url, filename, id) {
  function save(blob) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.onprogress = (e) => {
    if (!e.lengthComputable) {
    } else {
      let percent = parseInt((e.loaded / e.total) * 100);
      document.getElementById(id).innerText = percent + "%";
    }
  };
  xhr.onload = (e) => {
    save(xhr.response);
    handelUnloadEvent("decrement");
  };
  xhr.onerror = (e) => {
    handelUnloadEvent("decrement");
  };
  xhr.send();
  handelUnloadEvent("increment");
}

//following function is to stop navigating or stoping the app
let uploading = 0;
let navigationUrl = null;
const beforeUnloadHandler = (event) => {
  // Recommended
  event.preventDefault();

  // Included for legacy support, e.g. Chrome/Edge < 119
  event.returnValue = true;
  if (uploading > 0) {
    Swal.fire({
      title: "Close Page?",
      text: "File download will be canceled !!",
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
