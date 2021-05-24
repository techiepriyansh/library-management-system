async function fetchJSON(url) {
  const res = await fetch(url);
  const resData = await res.json();

  return resData;
}

async function postJSON(url, postData) {
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  };

  const res = await fetch(url, opts);
  const resData = await res.json();

  return resData;
}