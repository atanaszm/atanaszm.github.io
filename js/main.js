function getPageName(pathname) {
    return pathname.split("/").pop() || "index.html";
}

function updateActiveNavigation(url) {
    const sidebar = document.querySelector(".sidebar");
    const menu = document.querySelector(".menu");

    if (!sidebar || !menu) {
        return;
    }

    const links = [...menu.querySelectorAll("a")];
    const currentLink = links.find((link) => {
        return getPageName(new URL(link.href).pathname) === getPageName(url.pathname);
    });

    links.forEach((link) => {
        const isCurrentPage = link === currentLink;
        link.closest("li").classList.toggle("active", isCurrentPage);

        if (isCurrentPage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    document.querySelectorAll(".tabs a").forEach((link) => {
        const isCurrentPage = getPageName(new URL(link.href).pathname) === getPageName(url.pathname);
        link.classList.toggle("active", isCurrentPage);

        if (isCurrentPage) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    if (!currentLink) {
        return;
    }

    const currentItem = currentLink.closest("li");
    const sidebarTop = sidebar.getBoundingClientRect().top + sidebar.clientTop;
    const currentTop = currentItem.getBoundingClientRect().top - sidebarTop;
    let indicator = sidebar.querySelector(".menu-indicator");

    if (!indicator) {
        indicator = document.createElement("span");
        indicator.className = "menu-indicator";
        indicator.setAttribute("aria-hidden", "true");
        indicator.style.transform = `translateY(${currentTop}px)`;
        sidebar.append(indicator);
    }

    indicator.style.height = `${currentItem.offsetHeight}px`;
    indicator.style.transform = `translateY(${currentTop}px)`;
}

async function loadPage(url, addHistoryEntry) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            window.location.assign(url.href);
            return;
        }

        const html = await response.text();
        const nextDocument = new DOMParser().parseFromString(html, "text/html");
        const nextContent = nextDocument.querySelector(".content");
        const currentContent = document.querySelector(".content");

        if (!nextContent || !currentContent) {
            window.location.assign(url.href);
            return;
        }

        currentContent.innerHTML = nextContent.innerHTML;
        document.title = nextDocument.title;

        if (addHistoryEntry) {
            window.history.pushState({}, "", url.href);
        }

        updateActiveNavigation(url);
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        console.error("No s'ha pogut carregar la pàgina; es farà una navegació normal.", error);
        window.location.assign(url.href);
    }
}

document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const link = event.target.closest("a[href]");

    if (
        !link ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target ||
        link.hasAttribute("download")
    ) {
        return;
    }

    const url = new URL(link.href, window.location.href);
    const isSamePageAnchor =
        getPageName(url.pathname) === getPageName(window.location.pathname) &&
        url.hash !== "";

    if (
        url.origin !== window.location.origin ||
        isSamePageAnchor ||
        url.href === window.location.href
    ) {
        return;
    }

    event.preventDefault();
    loadPage(url, true);
});

window.addEventListener("popstate", () => {
    loadPage(new URL(window.location.href), false);
});

window.addEventListener("pageshow", () => {
    updateActiveNavigation(new URL(window.location.href));
});
