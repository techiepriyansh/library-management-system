async function authorize() {
  const authData = await fetchJSON('/authorize-admin');
  if (authData.authorized) {
    window.location.href = "/admin/dashboard/dashboard.html";
  }
}

authorize();