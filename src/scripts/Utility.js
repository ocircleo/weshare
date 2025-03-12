async function ping(url) {
  try {
    let user = sessionStorage.getItem("user");
    user = JSON.parse(user);
    let id = null;
    if (user) id = user.id;
    let request = await fetch(url, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    let res = await request.json();
    if (res.user) sessionStorage.setItem("user", JSON.stringify(res.user));
    return res;
  } catch (error) {
    // console.log(error);
    return { error: true, connected: false, message: error.message };
  }
}
async function ping() {
  //a function that fetches to all the available url and the function ping returns a value (Boolean). Also the fetch returns a userInfo the sets it sessionStorage and sets the url to session storage
  try {
    //First tries with default url saved into session storage
    let connectionUrl = sessionStorage.getItem("connectUrl");
    let result = { connected: false };
    if (connectionUrl) result = await pingFetch(connectionUrl);
    if (result.connected) return true;

    // now finds the available server address and tries to ping them
    let serverAddress = JSON.parse(sessionStorage.getItem("serverAddress"));
    if (!serverAddress.ip) return false;

    //now tries all the available url
    let ipArray = serverAddress.ip;
    for (let i = 0; i < ipArray.length; i++) {
      let url = "http://" + ipArray[i].address + ":" + serverAddress.port;
      let temResult = await pingFetch(url);
      if (temResult.connected) return true;
    }

    //if no url was connected default return false
    return false;
  } catch (error) {
    return false;
  }
}
async function pingFetch(url) {
  try {
    let user = JSON.parse(sessionStorage.getItem("user"));
    let request;
    //Adds body to fetch request if an user is in the session storage
    if (user?.id)
      request = await fetch(url + "/ping", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: user?.id }),
      });
    else
      request = await fetch(url + "/ping", {
        method: "PUT",
      });
    let res = await request.json();

    //connection checker
    if (!res?.connected)
      return { connected: false, message: "Failed to connect" };
    //passed all checks and successfully connected
    if (res.user) sessionStorage.setItem("user", JSON.stringify(res.user));
    sessionStorage.setItem("connectUrl", url);
    return { connected: true, message: "Successfully connected" };
  } catch (error) {
    return { connected: false, message: error.message };
  }
}
