async function authorize() {
  const authData = await fetchJSON('/authorize-admin');
  if (!authData.authorized) {
    window.location.href = "/";
  }
}

authorize();