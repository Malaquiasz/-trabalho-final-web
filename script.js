
// =========================================================
// SISTEMA SIMPLIFICADO - BACK-END INTEGRADO
// =========================================================

// Utilitários básicos que não dependem do localStorage
const debounce = (func, wait = 300, immediate = false) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(this, args);
    };
};

const throttle = (func, limit = 100) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

const isMobile = () => window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// =========================================================
// FUNÇÕES DE SCROLL (Mantidas)
// =========================================================

const scrollGradual = (direcao = 'down', pixels = 500) => {
    const currentPosition = window.pageYOffset;
    const targetPosition = direcao === 'down' ? currentPosition + pixels : Math.max(0, currentPosition - pixels);
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
};

const scrollGradualUp = () => scrollGradual('up', 500);
const scrollGradualDown = () => scrollGradual('down', 500);

// =========================================================
// BUSCA POR LOCAIS COMUNS (Do Index)
// =========================================================

function searchByLocation(local) {
    // Salva filtro no localStorage apenas para redirecionamento
    localStorage.setItem('filtroLocal', local);
    window.location.href = 'buscar.html';
}

// =========================================================
// FUNÇÕES GLOBAIS PARA BOTÕES DE ADMINISTRAÇÃO
// =========================================================

// Função removida - edição não está mais disponível

// =========================================================
// OTIMIZAÇÕES DE MOBILE
// =========================================================

const initMobileOptimizations = () => {
    if (!isMobile()) return;

    // Otimizações de performance para mobile
    let scrollTimeout;
    window.addEventListener('scroll', throttle(() => {
        document.body.classList.add('stop-animations-during-scroll');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('stop-animations-during-scroll');
        }, 100);
    }), { passive: true });

    // Prevenir zoom em inputs
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });
};

const initInteractiveElements = () => {
    // Hover effects otimizados
    document.addEventListener('mouseover', (e) => {
        const interactive = e.target.closest('.interactive');
        if (interactive) {
            interactive.classList.add('hovered');
        }
    }, { passive: true });

    document.addEventListener('mouseout', (e) => {
        const interactive = e.target.closest('.interactive');
        if (interactive) {
            interactive.classList.remove('hovered');
        }
    }, { passive: true });
};

// =========================================================
// INICIALIZAÇÃO PRINCIPAL
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializações básicas
    initMobileOptimizations();
    initInteractiveElements();

    console.log('✅ Sistema Achados e Perdidos carregado (Versão Back-end Integrada)');
});
