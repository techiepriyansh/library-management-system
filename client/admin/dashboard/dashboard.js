async function authorize() {
  const authData = await fetchJSON('/authorize-admin');
  if (!authData.authorized) {
    window.location.href = "/";
  }
}

window.onload = async function() {
  await authorize();
}

let rootEl = new Vue({
    el: '#root'
});
