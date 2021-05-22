async function authorize() {
  const res = await fetch('/authorize-admin');
  const resData = await res.json();

  console.log(resData);
  
  if (!resData.authorized) {
    window.location.href = "/";
  }
}

async function init() {
  await authorize();

  const res = await fetch('/pending-requests');
  const resData = await res.json();
  console.log(resData);
}

init();