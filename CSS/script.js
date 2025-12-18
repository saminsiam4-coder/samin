
function showCreateAccount() {
    document.getElementById('signinPage').classList.add('hidden');
    document.getElementById('createAccountPage').classList.remove('hidden');
}

function showSignIn() {
    document.getElementById('createAccountPage').classList.add('hidden');
    document.getElementById('signinPage').classList.remove('hidden');
    return false;
}

document.getElementById('signinForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const input = document.getElementById('signinInput').value;
    alert('Sign in with: ' + input);
});

document.getElementById('createAccountForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const confirmPassword = document.getElementById('userPasswordConfirm').value;

    if (password.length < 6) {
        alert('Password must be at least 6 characters long.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Passwords do not match. Please try again.');
        return;
    }

    alert('Account created for: ' + name + '\nEmail: ' + email);
});