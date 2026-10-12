document.addEventListener('DOMContentLoaded', () => {
    // Menyesuaikan menu aktif secara otomatis
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Menampilkan pesan alert saat mengklik email
    const emailLink = document.querySelector('a[href^="mailto:"]');
    if (emailLink) {
        emailLink.addEventListener('click', (e) => {
            alert('Aplikasi email Anda akan dibuka untuk mengirim pesan ke David Joko.');
        });
    }
});