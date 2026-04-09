document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const menuLinks = document.querySelectorAll("nav a");

    menuLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href === currentPage) {
            link.classList.add("active");
        }
    });

    const yearSpan = document.getElementById("current-year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});
