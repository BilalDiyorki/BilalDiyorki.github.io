document.addEventListener('DOMContentLoaded', () => {

    // ---------------------------------
    // 1. DİL DEĞİŞTİRME FONKSİYONU
    // ---------------------------------
    const langToggleButton = document.getElementById('lang-toggle-btn');
    const langToggleText = document.getElementById('lang-toggle-text');
    let currentLang = localStorage.getItem('lang') || 'tr'; 

    const translatableElements = document.querySelectorAll('[data-tr]');
    const listElements = document.querySelectorAll('[data-tr-list]');

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang); 
        if(langToggleText) langToggleText.innerText = lang.toUpperCase();

        translatableElements.forEach(el => {
            let newText = el.dataset[lang];
            if (newText === undefined) { newText = el.dataset['tr']; }
            if (newText === undefined) return;
            
            // 2 Satır Sınırı CSS ile hallediliyor
            el.innerText = newText;
        });
        listElements.forEach(ul => {
            try { 
                 const trList = JSON.parse(ul.dataset.trList || '[]'); 
                 const enList = JSON.parse(ul.dataset.enList || '[]'); 
                 const listToApply = (lang === 'tr') ? trList : (enList.length > 0 ? enList : trList);
                 ul.innerHTML = ''; 
                 listToApply.forEach(itemText => { const li = document.createElement('li'); li.innerText = itemText; ul.appendChild(li); });
             } catch (e) { console.error("Liste çevirme hatası:", e); }
        });
        
        updateViewAllButtonVisualText(); // Buton metnini de çevir
        initTypedJS(lang);
        // updateCopyButtonText(true); // Kopyala butonu HTML'de yoksa bu satırı kaldır/yorumla
    }
    
    if (langToggleButton) { 
        langToggleButton.addEventListener('click', () => {
            const newLang = currentLang === 'tr' ? 'en' : 'tr';
            setLanguage(newLang);
        });
    } else { console.error("Dil değiştirme butonu bulunamadı!"); }


    // ---------------------------------
    // 2. YAZI YAZMA EFEKTİ (TYPED.JS)
    // ---------------------------------
    let typedInstance = null;
    const typingStrings = {
        tr: ["Kıdemli Yazılım Geliştirici", "Sistem Tasarımcısı", "Backend Uzmanı"],
        en: ["Senior Software Developer", "System Designer", "Backend Expert"]
    };

    function initTypedJS(lang) {
        const typingElement = document.getElementById('typing-effect');
        if (!typingElement) return; 
        if (typedInstance) { typedInstance.destroy(); }
        typedInstance = new Typed('#typing-effect', {
            strings: typingStrings[lang], typeSpeed: 50, backSpeed: 30, loop: true, backDelay: 1500
        });
    }

    // ---------------------------------
    // 3. "TÜM PROJELERİ GÖR" BUTONU (Flicker/Patlama Düzeltmesi)
    // ---------------------------------
    const viewAllBtn = document.getElementById('view-all-projects-btn');
    const hiddenProjects = document.querySelectorAll('.project-hidden');
    const viewAllBtnTextSpan = viewAllBtn ? viewAllBtn.querySelector('span') : null; 

    function updateViewAllButtonVisualText() {
        if (!viewAllBtn || !viewAllBtnTextSpan) return;
        const isShowingHidden = document.querySelector('.project-hidden.is-visible') !== null;
        let newText = '';
        if (isShowingHidden) {
            newText = (currentLang === 'tr') ? 'Daha Az Göster' : 'Show Less';
        } else {
             newText = (currentLang === 'tr') ? 'Tüm Projeleri Görüntüle' : 'View All Projects';
        }
        viewAllBtnTextSpan.innerText = newText;
    }

    if (viewAllBtn) {
         viewAllBtn.addEventListener('click', () => {
             let isHiding = document.querySelector('.project-hidden.is-visible') !== null;
             
             hiddenProjects.forEach(project => {
                 if (isHiding) {
                     // ---- GİZLEME SÜRECİ (Bu kısım öncekiyle aynı) ----
                     project.classList.add('is-hiding');
                     project.classList.remove('is-visible'); 
                     
                     project.addEventListener('animationend', (e) => {
                         if (e.animationName === 'popOut') { 
                             project.style.display = 'none';
                             project.classList.remove('is-hiding');
                         }
                     }, { once: true });

                 } else {
                    // ---- GÖSTERME SÜRECİ (YENİ - Flicker Düzeltmeli) ----
                    
                    // 1. Önce animasyonun 'from' (başlangıç) stillerini JS ile zorla ayarla.
                    //    Bu, CSS'teki @keyframes popIn { from { ... } } ile aynı olmalı.
                    project.style.opacity = '0';
                    project.style.transform = 'translateY(20px) scale(0.98)';
                    
                    // 2. DOM'da görünür yap (ama hala JS stilleriyle gizli)
                    project.style.display = 'flex'; 

                    // 3. Tarayıcının bu stilleri işlemesi için ÇOK KISA bekle (reflow)
                    setTimeout(() => {
                        // 4. Animasyonu başlatan class'ı ekle
                        project.classList.add('is-visible');
                        
                        // 5. JS ile eklenen inline stilleri temizle ki CSS (animasyon)
                        //    kontrolü devralsın.
                        project.style.opacity = '';
                        project.style.transform = '';
                    }, 10); // 10ms yeterli
                 }
             });
             
             setTimeout(() => {
                updateViewAllButtonVisualText(); 
             }, 15);
         });
    }
    // ---------------------------------
    // 4. SCROLL-REVEAL ANİMASYONU
    // ---------------------------------
    const revealElements = document.querySelectorAll('.reveal');
    function revealOnScroll() {
        const windowHeight = window.innerHeight; const revealPoint = 100;
        document.querySelectorAll('.reveal').forEach(el => { 
            if (el.classList.contains('project-card') && el.classList.contains('is-visible')) { return; }
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) { el.classList.add('active'); }
        });
    }
    window.addEventListener('scroll', revealOnScroll);
     
    // ---------------------------------
    // 5. ETKİLEŞİMLİ PARÇACIK AĞI (Aynı)
    // ---------------------------------
    const canvas = document.getElementById('particle-canvas');
    if (canvas) { /* ... (V13-V18 arası aynı parçacık kodu) ... */ 
        const ctx = canvas.getContext('2d');
        let particles = [];
        let canvasWidth, canvasHeight;
        const mouse = { x: null, y: null, radius: 150 };
        window.addEventListener('mousemove', (event) => { mouse.x = event.clientX; mouse.y = event.clientY; });
        window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
        const particleColor = 'rgba(48, 185, 227, 0.5)'; 
        const linkColor = 'rgba(48, 185, 227, 0.1)'; 
        const linkDistance = 120; 
        const particleCount = 70; 
        const particleSpeed = 0.3;
        function resizeCanvas() {
            // YÜKSEK ÇÖZÜNÜRLÜK (DPI) DÜZELTMESİ
            const dpr = window.devicePixelRatio || 1; // Cihazın piksel yoğunluğunu al (örn: 2x, 3x)
            
            // Canvas'ın CSS boyutunu ekranla aynı yap
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
            canvas.style.width = canvasWidth + 'px';
            canvas.style.height = canvasHeight + 'px';
            
            // Canvas'ın gerçek çizim alanını piksel yoğunluğuyla çarp
            canvas.width = canvasWidth * dpr;
            canvas.height = canvasHeight * dpr;
            
            // Çizim bağlamını (context) da bu yeni orana göre ölçekle
            ctx.scale(dpr, dpr);
        }
        class Particle { constructor() { this.x = Math.random() * canvasWidth; this.y = Math.random() * canvasHeight; this.vx = (Math.random() - 0.5) * particleSpeed; this.vy = (Math.random() - 0.5) * particleSpeed; this.radius = 2; } draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fillStyle = particleColor; ctx.fill(); } update() { this.x += this.vx; this.y += this.vy; if (this.x < 0 || this.x > canvasWidth) this.vx *= -1; if (this.y < 0 || this.y > canvasHeight) this.vy *= -1; } }
        function createParticles() { particles = []; for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); } }
        function getDistance(p1, p2) { if (!p1 || !p2 || p1.x == null || p1.y == null || p2.x == null || p2.y == null) { return Infinity; } const dx = p1.x - p2.x; const dy = p1.y - p2.y; return Math.sqrt(dx * dx + dy * dy); }
        function drawLink(p1, p2, opacity, isMouse = false) { if (!p2 || p2.x == null || p2.y == null) return; ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.strokeStyle = isMouse ? `rgba(48, 227, 202, ${opacity * 0.3})` : `rgba(48, 227, 202, ${opacity * 0.1})`; ctx.lineWidth = isMouse ? 1.5 : 1; ctx.stroke(); }
        function drawLinks() { for (let i = 0; i < particles.length; i++) { for (let j = i + 1; j < particles.length; j++) { const distance = getDistance(particles[i], particles[j]); if (distance < linkDistance) { drawLink(particles[i], particles[j], 1 - (distance / linkDistance)); } } if (mouse.x) { const mouseDistance = getDistance(particles[i], mouse); if (mouseDistance < mouse.radius) { drawLink(particles[i], mouse, 1 - (mouseDistance / mouse.radius), true); } } } }
        function animate() { ctx.clearRect(0, 0, canvasWidth, canvasHeight); particles.forEach(p => { p.update(); p.draw(); }); drawLinks(); requestAnimationFrame(animate); }
        window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
        resizeCanvas(); createParticles(); animate();
    }

    // ---------------------------------
    // 6. YENİ: DİNAMİK ARKA PLAN RENGİ
    // ---------------------------------
    const bodyElement = document.body;
    const htmlElement = document.documentElement;
   // const startBgColor = '#0a0f1a'; // Başlangıç (en koyu)
   // const middleBgColor = '#1f2937'; // Orta (biraz daha açık)
   // const endBgColor = '#0a0f1a';   // Bitiş (tekrar en koyu)

   // const startBgColor = '#0c131a';
   //const middleBgColor = '#1c2b3a';
   //const endBgColor = '#0c131a';

  // const startBgColor = '#080808'; //(Neredeyse Siyah)
   //const middleBgColor = '#0c131a'; //(Orta Koyu Gri)
   //const endBgColor = '#080808'; //(Tekrar Siyah)

    // --- YENİ RENKLER (V23) ---
    //const startBgColor = '#05080D'; // Çok koyu, hafif gece mavisi
    //const middleBgColor = '#1a2a47'; // Koyu, mavimsi-yeşilimsi gri
    //const endBgColor = '#05080D';   // Tekrar çok koyu gece mavisi
/*
    const startBgColor = '#0a0f1a'; // Çok koyu gece mavisi (V22'ye geri döndük)
    const middleBgColor = '#121d31'; // YENİ: Tam ara koyu mavi
    const endBgColor = '#0a0f1a';   // Tekrar çok koyu gece mavisi

    const startBgColor = '#0a0f1a'; // Çok koyu gece mavisi (Aynı)
    const middleBgColor = '#102a33'; // YENİ: Koyu Petrol Yeşili/Mavisi
    const endBgColor = '#0a0f1a';   // Tekrar çok koyu gece mavisi (Aynı)

    const startBgColor = '#06080c'; // YENİ: Ultra Koyu Gece Mavisi/Siyah
    const middleBgColor = '#0b191f'; // YENİ: Daha Koyu Petrol/Teal
    const endBgColor = '#06080c';   // YENİ: Tekrar Ultra Koyu
*/


    const startBgColor = '#080d13'; // Koyu Gece Mavisi (Beğenilen)
    const middleBgColor = '#0d1320'; // YENİ: Çok Hafif Açık Koyu Mavi
    const endBgColor = '#080d13';   // Tekrar Koyu Gece Mavisi

    // İki HEX rengi arasında geçiş yapan yardımcı fonksiyon
    function interpolateColor(color1, color2, factor) {
        const r1 = parseInt(color1.substring(1, 3), 16);
        const g1 = parseInt(color1.substring(3, 5), 16);
        const b1 = parseInt(color1.substring(5, 7), 16);
        const r2 = parseInt(color2.substring(1, 3), 16);
        const g2 = parseInt(color2.substring(3, 5), 16);
        const b2 = parseInt(color2.substring(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Scroll olayını dinleyen fonksiyon
    function handleScrollBackground() {
        const scrollTotal = htmlElement.scrollHeight - htmlElement.clientHeight;
        if (scrollTotal <= 0) { // Scroll yoksa başlangıç renginde kal
            bodyElement.style.backgroundColor = startBgColor;
            return;
        }
        // Scroll yüzdesini hesapla (0 ile 1 arasında)
        const scrollPercent = Math.min(htmlElement.scrollTop / scrollTotal, 1);

        let currentBgColor;
        if (scrollPercent <= 0.5) {
            // İlk yarı: Koyu -> Açık
            const factor = scrollPercent / 0.5; // Yüzdeyi 0-1 arasına ölçekle
            currentBgColor = interpolateColor(startBgColor, middleBgColor, factor);
        } else {
            // İkinci yarı: Açık -> Koyu
            const factor = (scrollPercent - 0.5) / 0.5; // Yüzdeyi 0-1 arasına ölçekle
            currentBgColor = interpolateColor(middleBgColor, endBgColor, factor);
        }
        
        // Hesaplanan rengi body'e uygula
        bodyElement.style.backgroundColor = currentBgColor;
    }

    // Scroll olayını dinle
    window.addEventListener('scroll', handleScrollBackground);

    // Başlangıç rengini ayarla (CSS'te de fallback olarak var)
    bodyElement.style.backgroundColor = startBgColor;
    
    // Sayfa yüklendiğinde ve ilk scroll reveal çalıştığında da rengi ayarla
    handleScrollBackground();

    // ---------------------------------
    // 7. E-POSTA KOPYALA BUTONU (Footer - İsteğe bağlı)
    // ---------------------------------
    // Footer'daki butonun ID'sini kontrol et (Senin HTML'inde #request-cv-btn)
    const copyEmailBtn = document.getElementById('copy-email-footer-btn'); 
    
    // *** Senin HTML'in 'mailto' linki kullandığı için bu blok çalışmayacak, bu normal. ***
    // *** Eğer footer'daki butonu 'copy-email-footer-btn' ID'li bir <button> yaparsan bu çalışır. ***
    if (copyEmailBtn) {
        const copyEmailSpan = copyEmailBtn.querySelector('span');
        const emailToCopy = "bilalaydineem@gmail.com"; 
        let copyTimeout = null; 

        function updateCopyButtonText(isReset = false) {
            if (!copyEmailSpan) return;
            const isCopied = copyEmailBtn.classList.contains('copied');
            if (isReset && isCopied) {
                copyEmailBtn.classList.remove('copied');
                if (copyTimeout) clearTimeout(copyTimeout); 
            }
            let text_tr, text_en;
            if (copyEmailBtn.classList.contains('copied')) { 
                text_tr = "Kopyalandı!"; text_en = "Copied!";
            } else { 
                text_tr = "E-postamı Kopyala"; text_en = "Copy My Email";
            }
            copyEmailBtn.dataset.tr = text_tr;
            copyEmailBtn.dataset.en = text_en;
            copyEmailSpan.innerText = (currentLang === 'tr') ? text_tr : text_en;
        }

        copyEmailBtn.addEventListener('click', () => {
            if (copyEmailBtn.classList.contains('copied')) return;
            navigator.clipboard.writeText(emailToCopy).then(() => {
                copyEmailBtn.classList.add('copied'); 
                updateCopyButtonText();
                copyTimeout = setTimeout(() => {
                    copyEmailBtn.classList.remove('copied'); 
                    updateCopyButtonText();
                }, 2000); 
            }).catch(err => { console.error("Kopyalama başarısız:", err); });
        });
    }

    // ---------------------------------
    // 8. YENİ: PROJE MODAL YÖNETİCİSİ (Hata Düzeltmeli)
    // ---------------------------------
    
    // Proje Detay Modal'ı
    const projectModal = document.getElementById('project-modal');
    // SENİN HTML'İNDEKİ HATA: data-close yerine data-close-project kullan
    const projectModalCloseBtns = projectModal ? projectModal.querySelectorAll('[data-close], [data-close-project]') : [];
    const projectModalImg = document.getElementById('modal-img');
    const projectModalTitle = document.getElementById('modal-title');
    const projectModalDesc = document.getElementById('modal-desc');
    const projectModalTags = document.getElementById('modal-tags');
    // SENİN HTML'İNDEKİ HATA: .project-details-btn -> .open-modal olarak değiştir
    const projectDetailButtons = document.querySelectorAll('.project-btn.open-modal, .project-btn.project-details-btn');

    // Private Repo Modal'ı
    const privateModal = document.getElementById('private-repo-modal');
    const privateModalCloseBtns = privateModal ? privateModal.querySelectorAll('[data-close-private]') : [];
    const privateRepoButtons = document.querySelectorAll('.project-btn-git.is-private');

    // Genel Modal Açma/Kapama Fonksiyonları
    function openModal(modal) {
        if (!modal) return;
        
        // 1. Kaydırma çubuğu genişliğini (scrollbar) hesapla
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        // 2. Bu genişliği CSS değişkeni olarak ata (style.css'teki body.modal-open kullanacak)
        document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
        
        // 3. Body'e 'modal-open' class'ını ekle (Bu, overflow:hidden ve padding-right'ı tetikler)
        document.body.classList.add('modal-open');
        
        modal.classList.add('is-visible'); // CSS'teki .is-visible'ı kullan
        
        // ESKİ KODU SİL: document.body.style.overflow = 'hidden'; 
    }

    function closeModal(modal) {
        if (!modal) return;
        
        // 1. Body'den 'modal-open' class'ını kaldır
        document.body.classList.remove('modal-open');

        modal.classList.remove('is-visible'); // CSS'teki .is-visible'ı kaldır
        
        // ESKİ KODU SİL: document.body.style.overflow = ''; 
    }

    // --- Proje Detay Modal'ı Olayları ---
    if (projectModal) {
        projectDetailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 
                const card = button.closest('.project-card');
                if (!card) return;

                const imgSrc = card.querySelector('img') ? card.querySelector('img').src : '';
                const title = card.querySelector('h4') ? card.querySelector('h4').innerText : 'Proje Başlığı';
                // AÇIKLAMA: Artık data-tr'den tam metni alıyoruz
                const descP = card.querySelector('.project-content p');
                const description = descP ? (descP.dataset[currentLang] || descP.dataset['tr'] || descP.innerText) : '';
                const tags = card.querySelectorAll('.tag');

                if (projectModalImg) projectModalImg.style.backgroundImage = `url(${imgSrc})`;
                if (projectModalTitle) projectModalTitle.innerText = title;
                if (projectModalDesc) projectModalDesc.innerText = description;
                
                if (projectModalTags) {
                    projectModalTags.innerHTML = ''; 
                    tags.forEach(tag => {
                        const newTag = document.createElement('span');
                        newTag.className = 'tag'; 
                        newTag.innerText = tag.innerText;
                        projectModalTags.appendChild(newTag);
                    });
                }
                
                openModal(projectModal);
            });
        });

        projectModalCloseBtns.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal(projectModal);
            });
        });
    }

    // --- Private Repo Modal'ı Olayları ---
    if (privateModal) {
        privateRepoButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); // Linki açmayı engelle
                openModal(privateModal); // Uyarı modal'ını aç
            });
        });

        privateModalCloseBtns.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal(privateModal);
            });
        });
    }


    // ---------------------------------
    // 9. YENİ: YUKARI ÇIK BUTONU (Scroll-to-Top)
    // ---------------------------------
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');

    if (scrollToTopBtn) {
        
        // 1. Kaydırmayı dinle (Butonu göster/gizle)
        window.addEventListener('scroll', () => {
            // Sayfanın üstünden 400px'den fazla kaydırıldıysa
            if (window.scrollY > 400) {
                scrollToTopBtn.classList.add('is-visible');
            } else {
                scrollToTopBtn.classList.remove('is-visible');
            }
        });

        // 2. Tıklamayı dinle (Yukarı çık)
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' 
                // Not: Bu, 3. Fikir'deki (CSS) global smooth scroll'dan farklıdır.
                // Sadece bu butonun pürüzsüz çalışmasını sağlar.
            });
        });
    }


    // ---------------------------------
    // BAŞLANGIÇ AYARLARI (GECİKMELİ)
    // ---------------------------------
    setLanguage(currentLang); 
    setTimeout(revealOnScroll, 100);

}); // DOMContentLoaded sonu