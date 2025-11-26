document.addEventListener("DOMContentLoaded", () => {
  // Header scroll effect
  initializeHeader()
  // Mobile menu
  initializeMobileMenu()
  // Blog post content loader
  if (window.location.pathname.includes("blog-post.html")) {
    loadBlogPost()
  }
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
  // Blog card interactions
  initializeBlogCardInteractions()
  // Newsletter signup
  initializeNewsletterSignup()
  // Back to top button
  initializeBackToTop()
  // Lazy loading
  initializeLazyLoading()
  // Toast system
  initializeToastSystem()
  // Blog card animations
  initializeBlogCardAnimations()
  // Counters
  initializeCounters()
})

// Header scroll effect
function initializeHeader() {
  const header = document.querySelector(".header")
  let lastScrollY = window.scrollY

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY

    if (currentScrollY > 50) {
      header.style.background = "rgba(0, 0, 0, 0.98)"
      header.style.borderBottomColor = "rgba(188, 19, 254, 0.4)"
    } else {
      header.style.background = "rgba(0, 0, 0, 0.95)"
      header.style.borderBottomColor = "rgba(188, 19, 254, 0.2)"
    }

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      header.style.transform = "translateY(-100%)"
    } else {
      header.style.transform = "translateY(0)"
    }

    lastScrollY = currentScrollY
  })
}

// Mobile menu
function initializeMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const navMenu = document.querySelector(".nav-menu")

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenuBtn.classList.toggle("active")
      navMenu.classList.toggle("active")
    })

    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenuBtn.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })

    document.addEventListener("click", (e) => {
      if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
        mobileMenuBtn.classList.remove("active")
        navMenu.classList.remove("active")
      }
    })
  }
}

// Blog post content loader
function loadBlogPost() {
  const urlParams = new URLSearchParams(window.location.search)
  const articleId = urlParams.get("article")

  if (articleId && blogPosts[articleId]) {
    const post = blogPosts[articleId]

    const elements = {
      "post-title": post.title,
      "post-category": post.category,
      "post-date": post.date,
      "post-author": post.author,
      "post-read-time": post.readTime,
    }

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id)
      if (element) element.textContent = value
    })

    const postImage = document.getElementById("post-image")
    if (postImage) {
      postImage.src = post.image
      postImage.alt = post.title
    }

    const postContent = document.getElementById("post-content")
    if (postContent) {
      postContent.innerHTML = post.content
    }

    const postTags = document.getElementById("post-tags")
    if (postTags && post.tags) {
      postTags.innerHTML = post.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")
    }

    document.title = `${post.title} - NEXON FITNESS`

    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.content = post.content.replace(/<[^>]*>/g, "").substring(0, 160) + "..."
    }
  }
}

// Blog card interactions
function initializeBlogCardInteractions() {
  document.querySelectorAll(".bookmark-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      const icon = btn.querySelector("i")
      const articleId = btn.dataset.article
      const isBookmarked = icon.classList.contains("fas")

      if (isBookmarked) {
        icon.classList.remove("fas")
        icon.classList.add("far")
        removeBookmark(articleId)
        showToast("Artigo removido dos salvos", "info")
      } else {
        icon.classList.remove("far")
        icon.classList.add("fas")
        addBookmark(articleId)
        showToast("Artigo salvo com sucesso!", "success")
      }
    })
  })

  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      const icon = btn.querySelector("i")
      const countSpan = btn.querySelector(".like-count")
      const articleId = btn.dataset.article
      const isLiked = btn.classList.contains("liked")

      if (isLiked) {
        btn.classList.remove("liked")
        icon.classList.remove("fas")
        icon.classList.add("far")
        const currentCount = Number.parseInt(countSpan.textContent)
        countSpan.textContent = currentCount - 1
        removeLike(articleId)
      } else {
        btn.classList.add("liked")
        icon.classList.remove("far")
        icon.classList.add("fas")
        const currentCount = Number.parseInt(countSpan.textContent)
        countSpan.textContent = currentCount + 1
        addLike(articleId)

        btn.style.transform = "scale(1.2)"
        setTimeout(() => {
          btn.style.transform = "scale(1)"
        }, 200)
      }
    })
  })

  document.querySelectorAll(".share-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      e.stopPropagation()

      const card = btn.closest(".blog-card")
      const title = card.querySelector("h3").textContent
      const articleId = btn.dataset.article
      const url = `${window.location.origin}/blog/blog-post.html?article=${articleId}`

      if (navigator.share) {
        navigator
          .share({
            title: title,
            text: "Confira este artigo do NEXON FITNESS",
            url: url,
          })
          .catch(() => {
            fallbackShare(url)
          })
      } else {
        fallbackShare(url)
      }
    })
  })

  function fallbackShare(url) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          showToast("Link copiado para a área de transferência!", "success")
        })
        .catch(() => {
          showToast("Erro ao copiar link", "error")
        })
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        showToast("Link copiado!", "success")
      } catch (err) {
        showToast("Erro ao copiar link", "error")
      }
      document.body.removeChild(textArea)
    }
  }
}

// Newsletter signup
function initializeNewsletterSignup() {
  const subscribeBtn = document.getElementById("subscribeBtn")
  const newsletterEmail = document.getElementById("newsletterEmail")

  if (subscribeBtn && newsletterEmail) {
    subscribeBtn.addEventListener("click", (e) => {
      e.preventDefault()
      const email = newsletterEmail.value.trim()

      if (!email) {
        showToast("Por favor, insira seu e-mail", "error")
        return
      }

      if (!isValidEmail(email)) {
        showToast("Por favor, insira um e-mail válido", "error")
        return
      }

      subscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscrevendo...'
      subscribeBtn.disabled = true

      setTimeout(() => {
        showToast("Inscrição realizada com sucesso!", "success")
        newsletterEmail.value = ""
        subscribeBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Inscrever-se'
        subscribeBtn.disabled = false
      }, 2000)
    })

    newsletterEmail.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        subscribeBtn.click()
      }
    })
  }
}

// Back to top button
function initializeBackToTop() {
  const backToTopBtn = document.getElementById("backToTop")

  if (backToTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("visible")
      } else {
        backToTopBtn.classList.remove("visible")
      }
    })

    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    })
  }
}

// Lazy loading
function initializeLazyLoading() {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target

            const placeholder = document.createElement("div")
            placeholder.className = "image-placeholder"
            placeholder.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          `

            const container = img.parentElement
            if (container.style.position !== "relative") {
              container.style.position = "relative"
            }
            container.appendChild(placeholder)

            img.style.opacity = "0"
            img.style.transition = "opacity 0.3s ease"

            img.onload = () => {
              img.style.opacity = "1"
              if (placeholder.parentElement) {
                placeholder.parentElement.removeChild(placeholder)
              }
            }

            img.onerror = () => {
              if (placeholder.parentElement) {
                placeholder.parentElement.removeChild(placeholder)
              }
              img.src = "/images/placeholder.jpg" // Fallback image
            }

            if (img.dataset.src) {
              img.src = img.dataset.src
            }

            imageObserver.unobserve(img)
          }
        })
      },
      {
        rootMargin: "50px",
      },
    )

    document.querySelectorAll('img[loading="lazy"]').forEach((img) => {
      imageObserver.observe(img)
    })
  }
}

// Blog card animations
function initializeBlogCardAnimations() {
  const blogCards = document.querySelectorAll(".blog-card")

  blogCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`

    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.02)"

      const actions = this.querySelector(".blog-actions")
      if (actions) {
        actions.style.opacity = "1"
        actions.style.transform = "translateY(0)"
      }
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0) scale(1)"

      const actions = this.querySelector(".blog-actions")
      if (actions) {
        actions.style.opacity = "0"
        actions.style.transform = "translateY(-10px)"
      }
    })

    card.addEventListener("click", function (e) {
      if (!e.target.closest(".blog-actions")) {
        this.style.transform = "scale(0.98)"
        setTimeout(() => {
          this.style.transform = "translateY(0) scale(1)"
        }, 150)
      }
    })
  })
}

// Counters
function initializeCounters() {
  const counters = document.querySelectorAll(".stat-number")

  const animateCounter = (counter) => {
    const target = Number.parseInt(counter.textContent.replace(/\D/g, ""))
    const suffix = counter.textContent.replace(/\d/g, "")
    let current = 0
    const increment = target / 50
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        counter.textContent = target + suffix
        clearInterval(timer)
      } else {
        counter.textContent = Math.floor(current) + suffix
      }
    }, 30)
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target)
          counterObserver.unobserve(entry.target)
        }
      })
    })

    counters.forEach((counter) => {
      counterObserver.observe(counter)
    })
  }
}

// Toast system
function initializeToastSystem() {
  if (!document.getElementById("toast-container")) {
    const toastContainer = document.createElement("div")
    toastContainer.id = "toast-container"
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 350px;
    `
    document.body.appendChild(toastContainer)
  }
}

function showToast(message, type = "info", duration = 3000) {
  const toastContainer = document.getElementById("toast-container")
  const toast = document.createElement("div")

  const colors = {
    success: "linear-gradient(135deg, #10b981, #059669)",
    error: "linear-gradient(135deg, #ef4444, #dc2626)",
    info: "linear-gradient(135deg, #bc13fe, #7c3aed)",
    warning: "linear-gradient(135deg, #f59e0b, #d97706)",
  }

  const icons = {
    success: "fas fa-check-circle",
    error: "fas fa-exclamation-circle",
    info: "fas fa-info-circle",
    warning: "fas fa-exclamation-triangle",
  }

  toast.style.cssText = `
    background: ${colors[type]};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 500;
    transform: translateX(100%);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
  `

  toast.innerHTML = `
    <i class="${icons[type]}" style="font-size: 1.1rem;"></i>
    <span style="flex: 1;">${message}</span>
    <button style="background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; padding: 0; font-size: 1.1rem;" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `

  const progressBar = document.createElement("div")
  progressBar.style.cssText = `
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background: rgba(255,255,255,0.3);
    width: 100%;
    transform-origin: left;
    animation: progressBar ${duration}ms linear forwards;
  `
  toast.appendChild(progressBar)

  toastContainer.appendChild(toast)

  setTimeout(() => {
    toast.style.transform = "translateX(0)"
  }, 100)

  const timeoutId = setTimeout(() => {
    removeToast(toast)
  }, duration)

  toast.addEventListener("mouseenter", () => {
    clearTimeout(timeoutId)
    progressBar.style.animationPlayState = "paused"
  })

  toast.addEventListener("mouseleave", () => {
    setTimeout(() => removeToast(toast), 1000)
  })

  toast.addEventListener("click", () => {
    removeToast(toast)
  })

  function removeToast(toastElement) {
    toastElement.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement)
      }
    }, 300)
  }
}

const style = document.createElement("style")
style.textContent = `
  @keyframes progressBar {
    from { transform: scaleX(1); }
    to { transform: scaleX(0); }
  }
`
document.head.appendChild(style)

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function addBookmark(articleId) {
  const bookmarks = JSON.parse(localStorage.getItem("nexon-bookmarks") || "[]")
  if (!bookmarks.includes(articleId)) {
    bookmarks.push(articleId)
    localStorage.setItem("nexon-bookmarks", JSON.stringify(bookmarks))
  }
}

function removeBookmark(articleId) {
  let bookmarks = JSON.parse(localStorage.getItem("nexon-bookmarks") || "[]")
  bookmarks = bookmarks.filter((id) => id !== articleId)
  localStorage.setItem("nexon-bookmarks", JSON.stringify(bookmarks))
}

function addLike(articleId) {
  const likes = JSON.parse(localStorage.getItem("nexon-likes") || "[]")
  if (!likes.includes(articleId)) {
    likes.push(articleId)
    localStorage.setItem("nexon-likes", JSON.stringify(likes))
  }
}

function removeLike(articleId) {
  let likes = JSON.parse(localStorage.getItem("nexon-likes") || "[]")
  likes = likes.filter((id) => id !== articleId)
  localStorage.setItem("nexon-likes", JSON.stringify(likes))
}

// Blog post content data
const blogPosts = {
  "treino-casa": {
    title: "Treino em Casa: Guia Completo para Iniciantes",
    category: "Treino em Casa",
    date: "20/03/2024",
    author: "Prof. Carlos",
    readTime: "5 min",
    image: "../images/blog/treino-casa.jpg",
    tags: ["Iniciantes", "Casa", "Equipamentos"],
    content: `
      <p>Treinar em casa se tornou uma realidade para muitas pessoas, especialmente após a pandemia. Com o equipamento certo e a mentalidade adequada, você pode alcançar resultados incríveis sem sair de casa.</p>
      
      <h2>Equipamentos Básicos</h2>
      <p>Para começar, você não precisa de muito:</p>
      <ul>
          <li><strong>Tapete de exercícios:</strong> Fundamental para exercícios no solo</li>
          <li><strong>Halteres ajustáveis:</strong> Versáteis para diversos exercícios</li>
          <li><strong>Faixa elástica:</strong> Excelente para resistência variável</li>
          <li><strong>Barra de porta:</strong> Para exercícios de puxada</li>
      </ul>
      
      <h2>Rotina de Treino Semanal</h2>
      <p>Organize sua semana com treinos variados para trabalhar todos os grupos musculares de forma equilibrada.</p>
      
      <h3>Segunda-feira: Peito e Tríceps</h3>
      <ul>
          <li>Flexões: 3x12-15</li>
          <li>Flexões diamante: 3x8-10</li>
          <li>Mergulho na cadeira: 3x10-12</li>
      </ul>
      
      <h3>Terça-feira: Costas e Bíceps</h3>
      <ul>
          <li>Puxadas na barra: 3x8-10</li>
          <li>Remada com faixa: 3x12-15</li>
          <li>Rosca com halteres: 3x10-12</li>
      </ul>
    `,
  },
  nutricao: {
    title: "Nutrição para Ganho de Massa Muscular",
    category: "Nutrição",
    date: "18/03/2024",
    author: "Dra. Ana",
    readTime: "8 min",
    image: "../images/blog/nutricao.jpg",
    tags: ["Massa Muscular", "Dieta", "Proteínas"],
    content: `
      <p>A nutrição é fundamental para o ganho de massa muscular. Sem uma alimentação adequada, seus treinos não renderão os resultados esperados.</p>
      
      <h2>Macronutrientes Essenciais</h2>
      <p>Entenda a importância de cada macronutriente:</p>
      <ul>
          <li><strong>Proteínas:</strong> 1.6-2.2g por kg de peso corporal</li>
          <li><strong>Carboidratos:</strong> 4-7g por kg de peso corporal</li>
          <li><strong>Gorduras:</strong> 0.8-1.2g por kg de peso corporal</li>
      </ul>
      
      <h2>Timing Nutricional</h2>
      <p>O momento das refeições também importa para maximizar os resultados.</p>
      
      <h3>Pré-treino (1-2 horas antes)</h3>
      <ul>
          <li>Carboidratos complexos</li>
          <li>Proteína magra</li>
          <li>Baixo teor de gordura</li>
      </ul>
      
      <h3>Pós-treino (até 30 minutos)</h3>
      <ul>
          <li>Proteína de rápida absorção</li>
          <li>Carboidratos simples</li>
          <li>Hidratação adequada</li>
      </ul>
    `,
  },
  suplementacao: {
    title: "Suplementos Essenciais para o Seu Treino",
    category: "Suplementação",
    date: "15/03/2024",
    author: "Dr. Pedro",
    readTime: "6 min",
    image: "../images/blog/suplementacao.jpg",
    tags: ["Suplementos", "Performance", "Resultados"],
    content: `
      <p>Os suplementos podem ser grandes aliados na busca pelos seus objetivos fitness, mas é importante saber quais realmente fazem diferença.</p>
      
      <h2>Suplementos Básicos</h2>
      <p>Comece com o essencial:</p>
      <ul>
          <li><strong>Whey Protein:</strong> Para recuperação muscular</li>
          <li><strong>Creatina:</strong> Para força e potência</li>
          <li><strong>Multivitamínico:</strong> Para suprir deficiências</li>
          <li><strong>Ômega 3:</strong> Para saúde geral</li>
      </ul>
      
      <h2>Como e Quando Tomar</h2>
      <p>O timing e a dosagem corretos são fundamentais para maximizar os benefícios.</p>
      
      <h3>Whey Protein</h3>
      <ul>
          <li><strong>Dosagem:</strong> 25-30g por porção</li>
          <li><strong>Quando:</strong> Pós-treino e entre refeições</li>
          <li><strong>Como:</strong> Misturado com água ou leite</li>
      </ul>
      
      <h3>Creatina</h3>
      <ul>
          <li><strong>Dosagem:</strong> 3-5g por dia</li>
          <li><strong>Quando:</strong> Qualquer horário, consistência é chave</li>
          <li><strong>Como:</strong> Misturada com água ou suco</li>
      </ul>
    `,
  },
}

// Efeito de typing ao título principal se existir
function typeWriter(element, text, speed = 100) {
  let i = 0
  element.innerHTML = ""

  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i)
      i++
      setTimeout(type, speed)
    }
  }

  type()
}

// Aplicar efeito de typing ao título principal se existir
const mainTitle = document.querySelector(".blog-header-content h1")
if (mainTitle) {
  const originalText = mainTitle.textContent
  typeWriter(mainTitle, originalText, 150)
}

document.addEventListener("DOMContentLoaded", () => {
  const bookmarks = JSON.parse(localStorage.getItem("nexon-bookmarks") || "[]")
  const likes = JSON.parse(localStorage.getItem("nexon-likes") || "[]")

  document.querySelectorAll(".bookmark-btn").forEach((btn) => {
    const articleId = btn.dataset.article
    if (bookmarks.includes(articleId)) {
      const icon = btn.querySelector("i")
      icon.classList.remove("far")
      icon.classList.add("fas")
    }
  })

  document.querySelectorAll(".like-btn").forEach((btn) => {
    const articleId = btn.dataset.article
    if (likes.includes(articleId)) {
      btn.classList.add("liked")
      const icon = btn.querySelector("i")
      icon.classList.remove("far")
      icon.classList.add("fas")
    }
  })
})
