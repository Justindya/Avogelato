document.addEventListener('DOMContentLoaded', () => {

    // ===== 0. NAVBAR HEIGHT & SCROLL PADDING =====
    const navbar = document.querySelector('.navbar');
    const setScrollPadding = () => {
        const navbarHeight = navbar.offsetHeight;
        document.documentElement.style.setProperty('--scroll-padding', navbarHeight + 'px');
    };
    
    setScrollPadding(); // Atur saat load
    window.addEventListener('resize', setScrollPadding); // Atur ulang saat resize

    // ===== 1. THEME MANAGEMENT =====
       // ===== 1.B NAVBAR SCROLL EFFECT (GLASSMORPHISM) =====
    const navbarElement = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            // Jika scroll lebih dari 50px, tambah class 'scrolled' (jadi kaca)
            navbarElement.classList.add('scrolled');
        } else {
            // Jika di paling atas, hapus class (jadi transparan)
            navbarElement.classList.remove('scrolled');
        }
    });

    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement; // Target <html> untuk [data-theme]

    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    loadTheme(); // Terapkan tema saat memuat

    // ===== 2. NAVIGATION MANAGEMENT (SMOOTH SCROLL) =====
    // sudah pakai `scroll-behavior: smooth;` di CSS, 
    // tapi saya tambahkan JS untuk `scrollIntoView` sebagai fallback
    // dan untuk memastikan offset `scroll-padding-top` bekerja.
    document.querySelectorAll('.navbar .nav-link, .hero-text a, .navbar-brand').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    // Gunakan scrollIntoView untuk scrolling
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Menambahkan 'active' class ke nav-link saat scroll
    const navLinks = document.querySelectorAll('.navbar .nav-link');
    const sections = document.querySelectorAll('.section-fullscreen');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { threshold: 0.5 }); // 50% section terlihat

    sections.forEach(section => {
        sectionObserver.observe(section);
    });


    // ===== 3. ANIMASI SCROLL "SMOOTH" =====
    // Menggunakan IntersectionObserver untuk animasi "fade-in" saat scroll
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    // Opsi observer 
    const observerOptions = {
        threshold: 0.15, // Muncul saat 15% elemen terlihat
        rootMargin: '0px 0px -80px 0px' // Muncul 80px *sebelum* elemen mencapai bagian bawah layar
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Menambahkan delay jika ada atribut data-scroll-delay
                const delay = entry.target.getAttribute('data-scroll-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('is-visible');
                }, delay);
                
                // Berhenti mengamati elemen ini setelah terlihat
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Amati setiap elemen
    revealElements.forEach(el => {
        observer.observe(el);
    });


    // ===== 4. TESTIMONIALS CRUD MANAGEMENT =====
    let testimonials = [];
    const testimonialForm = document.getElementById('testimonialForm');
    const testimonialsList = document.getElementById('testimonialsList');
    const emptyState = document.getElementById('emptyState');
    
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    const editForm = document.getElementById('editForm');
    const editIndexField = document.getElementById('editIndex');
    const editNameField = document.getElementById('editName');
    const editCommentField = document.getElementById('editComment');
    const saveEditButton = document.getElementById('saveEdit');

    function loadTestimonials() {
        const stored = localStorage.getItem('testimonials');
        if (stored) {
            try { testimonials = JSON.parse(stored); } catch (e) { testimonials = []; }
        }
        renderTestimonials();
    }

    function saveTestimonials() {
        localStorage.setItem('testimonials', JSON.stringify(testimonials));
    }

    function renderTestimonials() {
        if (testimonials.length === 0) {
            testimonialsList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';
        
        testimonialsList.innerHTML = testimonials.map((testimonial, index) => `
            <div class="col-md-6 col-lg-4 reveal-on-scroll">
                <div class="testimonial-card">
                    <div class="testimonial-header">
                        <div>
                            <div class="testimonial-name">${escapeHtml(testimonial.name)}</div>
                            <div class="testimonial-date">${testimonial.date}</div>
                        </div>
                        <div class="testimonial-actions">
                            <button class="btn btn-sm btn-warning edit-btn" data-index="${index}" aria-label="Edit">
                                <i class="bi bi-pencil-fill"></i>
                            </button>
                            <button class="btn btn-sm btn-danger delete-btn" data-index="${index}" aria-label="Hapus">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </div>
                    </div>
                    <div class="testimonial-comment">
                        ${escapeHtml(testimonial.comment)}
                    </div>
                </div>
            </div>
        `).join('');

        // Setelah merender, amati elemen testimoni baru
        document.querySelectorAll('#testimonialsList .reveal-on-scroll').forEach(el => {
            if (!el.classList.contains('is-visible')) {
                observer.observe(el);
            }
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(date).toLocaleDateString('id-ID', options);
    }

    testimonialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('nameInput').value.trim();
        const comment = document.getElementById('commentInput').value.trim();
        if (name && comment) {
            const newTestimonial = { name: name, comment: comment, date: formatDate(new Date()) };
            testimonials.unshift(newTestimonial);
            saveTestimonials();
            renderTestimonials();
            testimonialForm.reset();
            showToast('Testimoni berhasil ditambahkan!', 'success');
        }
    });

    testimonialsList.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const index = parseInt(target.getAttribute('data-index'));
        if (target.classList.contains('edit-btn')) {
            editTestimonial(index);
        } else if (target.classList.contains('delete-btn')) {
            deleteTestimonial(index);
        }
    });

    function editTestimonial(index) {
        const testimonial = testimonials[index];
        editIndexField.value = index;
        editNameField.value = testimonial.name;
        editCommentField.value = testimonial.comment;
        editModal.show();
    }

    saveEditButton.addEventListener('click', () => {
        const index = parseInt(editIndexField.value);
        const name = editNameField.value.trim();
        const comment = editCommentField.value.trim();
        if (name && comment && index >= 0 && index < testimonials.length) {
            testimonials[index].name = name;
            testimonials[index].comment = comment;
            testimonials[index].date = formatDate(new Date()) + ' (diubah)';
            saveTestimonials();
            renderTestimonials();
            editModal.hide();
            showToast('Testimoni berhasil diupdate!', 'success');
        }
    });

    function deleteTestimonial(index) {
        if (confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) {
            testimonials.splice(index, 1);
            saveTestimonials();
            renderTestimonials();
            showToast('Testimoni berhasil dihapus!', 'success');
        }
    }

    // Fungsi Notifikasi Toast
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 80px; /* Di bawah header */
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ===== 5. PWA SERVICE WORKER REGISTRATION=====
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('SW registered:', registration.scope);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        });
    }

    // ===== 6. INITIALIZE APP =====
    loadTestimonials(); // Muat data saat halaman dibuka
});