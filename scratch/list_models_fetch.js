const key = "AIzaSyBMfSLtv00rAqiRDfDcsSvKhz4C7zFcPOI";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

async function list() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

list();
