async function authorize() {
  const authData = await fetchJSON('/authorize-user');
  if (authData.authorized) {
    window.location.href = "/user/home/home.html";
  }
}

authorize();