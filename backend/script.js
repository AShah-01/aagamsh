lucide.createIcons();

const siteHeader = document.querySelector(".site-header");
const desktopNav = document.querySelector(".desktop-links");
const desktopNavToggle = document.querySelector(".desktop-nav-toggle");
const menuButton = document.querySelector(".menu-button");
const closeMenuButton = document.querySelector(".close-menu-button");
const mobileMenu = document.querySelector(".mobile-menu");
const menuOverlay = document.querySelector(".menu-overlay");
const backToTop = document.querySelector(".back-to-top");
const subjectSelect = document.getElementById("ss");
const otherSubjectField = document.getElementById("osf");
const otherSubjectInput = document.getElementById("osi");
const contactForm = document.querySelector(".contact-form");
const formStatus = document.querySelector(".form-status");
const netlifyFunctionUrl = "/.netlify/functions/send-email";

const revealTargets = document.querySelectorAll("[data-reveal]");
const sections = document.querySelectorAll("main section[id]");
const desktopLinks = desktopNav ? desktopNav.querySelectorAll("a") : [];
const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll("a") : [];
const allNavLinks = [...desktopLinks, ...mobileLinks];

function getDisplayedEmail() {
    const emailAnchor = document.querySelector('a[href^="mailto:"]');
    if (emailAnchor && emailAnchor.getAttribute("href")) {
        return emailAnchor.getAttribute("href").replace("mailto:", "").trim();
    }
    return "aagamshah250506@gmail.com";
}

function setMobileMenuOpen(isOpen) {
    if (!mobileMenu || !menuOverlay) {
        return;
    }

    mobileMenu.dataset.open = String(isOpen);
    menuOverlay.hidden = !isOpen;
    document.body.style.overflow = isOpen ? "hidden" : "";
}

function closeMobileMenu() {
    setMobileMenuOpen(false);
}

if (menuButton) {
    menuButton.addEventListener("click", () => setMobileMenuOpen(true));
}

if (closeMenuButton) {
    closeMenuButton.addEventListener("click", closeMobileMenu);
}

if (menuOverlay) {
    menuOverlay.addEventListener("click", closeMobileMenu);
}

mobileLinks.forEach((link) => link.addEventListener("click", closeMobileMenu));

// Copy email to clipboard functionality
const copyEmailBtn = document.querySelector(".copy-email-btn");
if (copyEmailBtn) {
    copyEmailBtn.addEventListener("click", async () => {
        const email = getDisplayedEmail();
        try {
            await navigator.clipboard.writeText(email);
            const originalIcon = copyEmailBtn.innerHTML;
            copyEmailBtn.innerHTML = '<i data-lucide="check"></i>';
            copyEmailBtn.setAttribute("aria-label", "Email copied!");

            lucide.createIcons();

            setTimeout(() => {
                copyEmailBtn.innerHTML = originalIcon;
                copyEmailBtn.setAttribute("aria-label", "Copy email address");
                lucide.createIcons();
            }, 2000);
        } catch (err) {
            console.error("Failed to copy email:", err);
        }
    });
}

if (desktopNavToggle && siteHeader) {
    desktopNavToggle.addEventListener("click", () => {
        const isCollapsed = siteHeader.dataset.collapsed === "true";
        siteHeader.dataset.collapsed = String(!isCollapsed);
        desktopNavToggle.textContent = isCollapsed ? "Hide Nav" : "Show Nav";
        desktopNavToggle.setAttribute("aria-expanded", String(isCollapsed));
    });
}

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.dataset.visible = "true";
            }
        });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
);

revealTargets.forEach((target) => revealObserver.observe(target));

function updateActiveNavLink() {
    let currentSectionId = "";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop - 140;
        if (window.scrollY >= sectionTop) {
            currentSectionId = section.id;
        }
    });

    allNavLinks.forEach((link) => {
        const isActive = link.getAttribute("href") === `#${currentSectionId}`;
        if (isActive) {
            link.dataset.active = "true";
        } else {
            delete link.dataset.active;
        }
    });
}

function updateBackToTop() {
    if (!backToTop) {
        return;
    }

    backToTop.dataset.visible = String(window.scrollY > 500);
}

window.addEventListener("scroll", () => {
    updateActiveNavLink();
    updateBackToTop();
});

updateActiveNavLink();
updateBackToTop();

if (backToTop) {
    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

if (subjectSelect && otherSubjectField && otherSubjectInput) {
    subjectSelect.addEventListener("change", () => {
        const shouldShowOther = subjectSelect.value === "Other";
        otherSubjectField.hidden = !shouldShowOther;
        otherSubjectInput.required = shouldShowOther;

        if (!shouldShowOther) {
            otherSubjectInput.value = "";
        }
    });
}

if (contactForm && formStatus) {
    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const submitButton = contactForm.querySelector('button[type="submit"]');
        const originalButtonContent = submitButton
            ? submitButton.innerHTML
            : "";

        // Get form data
        const name = document.getElementById("nameInput").value.trim();
        const email = document.getElementById("emailInput").value.trim();
        const subject =
            subjectSelect.value === "Other"
                ? document.getElementById("osi").value.trim()
                : subjectSelect.value.trim();
        const message = document.getElementById("messageInput").value.trim();
        const company = contactForm
            .querySelector('input[name="company"]')
            ?.value.trim();

        if (!name || !email || !subject || !message) {
            formStatus.hidden = false;
            formStatus.textContent = "Please fill out all required fields.";
            formStatus.style.color = "#e74c3c";
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML =
                '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><circle opacity="0.25" cx="12" cy="12" r="10"></circle><path opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...';
        }

        const showStatus = (messageText, isError) => {
            formStatus.hidden = false;
            formStatus.textContent = messageText;
            formStatus.style.color = isError ? "#e74c3c" : "";
        };

        const resetSubmitButton = () => {
            if (submitButton) {
                submitButton.innerHTML = originalButtonContent;
                submitButton.disabled = false;
            }
        };

        try {
            const response = await fetch(netlifyFunctionUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    subject: subject,
                    message: message,
                    company: company,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showStatus(
                    "Message sent successfully! I'll get back to you soon.",
                    false,
                );
                contactForm.reset();
                if (otherSubjectField) {
                    otherSubjectField.hidden = true;
                }
                resetSubmitButton();

                window.setTimeout(() => {
                    formStatus.hidden = true;
                    formStatus.textContent = "";
                    formStatus.style.color = "";
                }, 5000);
            } else {
                throw new Error(
                    result && result.message
                        ? result.message
                        : "Failed to send message",
                );
            }
        } catch (error) {
            console.error("Error sending message:", error);
            showStatus(
                `Unable to send right now. Please email me directly at ${getDisplayedEmail()}.`,
                true,
            );
            resetSubmitButton();

            window.setTimeout(() => {
                formStatus.hidden = true;
                formStatus.textContent = "";
                formStatus.style.color = "";
            }, 7000);
        }
    });
}
