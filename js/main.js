function animateActiveMenuBorder() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const previousPage = sessionStorage.getItem("portfolio-page");
    const sidebar = document.querySelector(".sidebar");
    const menu = document.querySelector(".menu");

    if (sidebar && menu) {
        const links = [...menu.querySelectorAll("a")];
        const getPage = (link) => new URL(link.href).pathname.split("/").pop() || "index.html";
        const currentLink = links.find((link) => getPage(link) === currentPage);

        links.forEach((link) => {
            const isCurrentPage = link === currentLink;
            const menuItem = link.closest("li");

            menuItem.classList.toggle("active", isCurrentPage);

            if (isCurrentPage) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        if (currentLink) {
            sidebar.querySelector(".menu-indicator")?.remove();

            const currentItem = currentLink.closest("li");
            const previousItem = links.find((link) => getPage(link) === previousPage)?.closest("li");
            const indicator = document.createElement("span");
            const currentTop = menu.offsetTop + currentItem.offsetTop;
            const startTop = previousItem
                ? menu.offsetTop + previousItem.offsetTop
                : currentTop;

            indicator.className = "menu-indicator";
            indicator.setAttribute("aria-hidden", "true");
            indicator.style.height = `${currentItem.offsetHeight}px`;
            indicator.style.transform = `translateY(${startTop}px)`;
            sidebar.append(indicator);

            requestAnimationFrame(() => {
                indicator.style.transform = `translateY(${currentTop}px)`;
            });
        }
    }

    sessionStorage.setItem("portfolio-page", currentPage);
}

window.addEventListener("pageshow", animateActiveMenuBorder);
