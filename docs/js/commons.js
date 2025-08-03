const _originalFetch = window.fetch;
var loggingIn = false;
window.fetch = async function (input, init = {}) {
    init = init || {};
    let token = localStorage.getItem('token');

    init.headers = {
        ...(init.headers || {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    let response = await _originalFetch(input, init);

    if (response.status === 401 && !loggingIn) {
        hideLoading();
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        
        const shouldLogin = await Swal.fire({
            title: 'Expired Session or Not Logged in',
            text: 'Do you wish to login?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
        });

        if (!shouldLogin.isConfirmed) {
            window.location.reload();
            throw new Error('User did not Login');
        }

        try {
            await waitForLogin();
            token = localStorage.getItem('token');
            if (!token){
                window.location.reload();
                throw new Error('Login Failed');
            } 
            init.headers['Authorization'] = `Bearer ${token}`;
            response = await _originalFetch(input, init);
        } catch (err) {
            console.warn(err.message);
            throw err;
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
