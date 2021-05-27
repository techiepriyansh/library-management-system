async function authorize() {
  const authData = await fetchJSON('/authorize-admin');
  if (!authData.authorized) {
    window.location.href = "/admin/login/login.html";
  }
}

authorize();