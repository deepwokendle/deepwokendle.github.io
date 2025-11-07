const _originalFetch = window.fetch;
let loggingIn = false;

window.fetch = async function (input, init = {}) {
  init = init || {};

  const token = localStorage.getItem('token');
  init.headers = {
    ...(init.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  let response = await _originalFetch(input, init);

  if (response.status === 401 && !loggingIn) {
    hideLoading();

    const shouldLogin = await Swal.fire({
      title: `${localStorage.getItem('token') != null ? 'Expired Session' : 'Not Logged In'}`,
      text: 'Do you wish to login?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    if (!shouldLogin.isConfirmed) {
      window.location.reload();
      throw new Error('User did not Login');
    }

    try {
      const result = await waitForLogin();
      loggingIn = true;
      const newToken = localStorage.getItem('token');
      const newUsername = localStorage.getItem('username') || '';

      if (!newToken) {
        window.location.reload();
        throw new Error('Login Failed');
      }

      init.headers['Authorization'] = `Bearer ${newToken}`;

      let newInput = input;
      if (typeof input === 'string') {
        const url = new URL(input, window.location.origin);
        url.searchParams.set('username', newUsername);
        newInput = url.toString();
      } else if (input instanceof Request) {
        const reqClone = input.clone();
        const url = new URL(reqClone.url);
        url.searchParams.set('username', newUsername);
        newInput = new Request(url.toString(), {
          method: reqClone.method,
          headers: reqClone.headers,
          body: reqClone.body,
          mode: reqClone.mode,
          credentials: reqClone.credentials,
          cache: reqClone.cache,
          redirect: reqClone.redirect,
          referrer: reqClone.referrer,
          integrity: reqClone.integrity,
        });
      }

      response = await _originalFetch(newInput, init);
    } catch (err) {
      console.warn(err.message);
      throw err;
    } finally {
      loggingIn = false;
    }
  }

  return response;
};
function getApiUrl() {
    const host = window.location.hostname;

    if (!host || host === 'localhost' || host === '127.0.0.1') {
        return 'https://localhost:7021/api';
    }

    return 'https://deepwokendle.onrender.com/api';
}
