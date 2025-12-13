document.addEventListener('DOMContentLoaded', () => {
    // Funkcja do obserwowania elementów i dodawania klasy 'active' po wejściu w viewport
    const observeElements = () => {
        // Elementy, które mają się animować
        const elementsToAnimate = document.querySelectorAll('.fade-in');

        // Opcje dla Intersection Observer
        const observerOptions = {
            root: null, // viewport jako root
            rootMargin: '0px',
            threshold: 0.1 // Wyzwalaj, gdy 10% elementu jest widoczne
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Jeśli element jest widoczny
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Opcjonalnie: przestań obserwować po aktywacji, aby animacja wykonała się tylko raz
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Obserwuj każdy element
        elementsToAnimate.forEach(element => {
            observer.observe(element);
        });
    };

    // Włączanie Smooth Scrolling (Płynne przewijanie) dla linków nawigacyjnych
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Uruchomienie obserwatora dla animacji
    observeElements();
});