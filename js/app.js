// ========================================
// CADASTRO DE PROJETOS
// ========================================

// Elementos do cadastro
const modal = document.querySelector('#project-modal')
const form = document.querySelector('#project-form')
const openButton = document.querySelector('#new-project-button')
const closeButton = document.querySelector('#close-modal')
const saveButton = document.querySelector('#save-project')

const projectList = document.querySelector('#project-list')
const successMessage = document.querySelector('#project-success')
const activeProjects = document.querySelector('#active-projects')

// Seleciona apenas os campos que possuem o atributo name.
const fields = Array.from(form.elements).filter((field) => field.name)

// Retorna a data local no formato AAAA-MM-DD.
function getToday() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

// Define o erro de cada campo.
function getError(field) {
    const value = field.value.trim()

    if (!value) {
        return 'Preencha este campo.'
    }

    if (field.name === 'name' && value.length < 3) {
        return 'Digite pelo menos 3 caracteres.'
    }

    if (field.name === 'description' && value.length < 10) {
        return 'Digite pelo menos 10 caracteres.'
    }

    if (field.name === 'deadline' && value < getToday()) {
        return 'Escolha hoje ou uma data futura.'
    }

    return ''
}

// Exibe a mensagem de erro e altera a borda do campo.
function validateField(field) {
    const error = getError(field)
    const message = document.querySelector(`#${field.name}-error`)

    field.classList.remove(
        'border-slate-300',
        'border-red-500',
        'border-emerald-500'
    )

    field.classList.add(error ? 'border-red-500' : 'border-emerald-500')
    field.setAttribute('aria-invalid', String(Boolean(error)))

    message.textContent = error
    message.classList.toggle('hidden', !error)

    return !error
}

// Limpa os campos e os estados de validação.
function resetForm() {
    form.reset()

    fields.forEach((field) => {
        field.classList.remove('border-red-500', 'border-emerald-500')
        field.classList.add('border-slate-300')
        field.removeAttribute('aria-invalid')

        const message = document.querySelector(`#${field.name}-error`)
        message.textContent = ''
        message.classList.add('hidden')
    })
}

// Monta o card de um novo projeto.
function addProject(project) {
    const card = document.createElement('article')

    card.className =
        'group flex flex-col rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg'

    // A estrutura é fixa; os dados são inseridos com textContent.
    card.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span
        data-category
        class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
      ></span>

      <span
        data-priority
        class="text-xs font-semibold text-slate-600"
      ></span>
    </div>

    <h3
      data-name
      class="mt-4 break-words text-lg font-bold transition-colors group-hover:text-indigo-600"
    ></h3>

    <p
      data-description
      class="mt-2 break-words text-sm text-slate-500"
    ></p>

    <div class="mt-auto pt-5">
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-500">Progresso</span>
        <span class="font-semibold">0%</span>
      </div>

      <div
        data-progress
        role="progressbar"
        aria-valuenow="0"
        aria-valuemin="0"
        aria-valuemax="100"
        class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
      >
        <div class="h-full w-0 rounded-full bg-indigo-500"></div>
      </div>

      <div class="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
        <span data-owner class="break-words"></span>
        <span data-deadline></span>
      </div>
    </div>
  `

    card.querySelector('[data-name]').textContent = project.name
    card.querySelector('[data-category]').textContent = project.category

    card.querySelector('[data-priority]').textContent =
        `Prioridade ${project.priority}`

    card.querySelector('[data-description]').textContent =
        project.description

    card.querySelector('[data-owner]').textContent =
        `Responsável: ${project.owner}`

    const formattedDate = project.deadline.split('-').reverse().join('/')

    card.querySelector('[data-deadline]').textContent =
        `Prazo: ${formattedDate}`

    card.querySelector('[data-progress]').setAttribute(
        'aria-label',
        `Progresso de ${project.name}`
    )

    projectList.append(card)

    // Novos projetos começam como ativos.
    activeProjects.textContent = Number(activeProjects.textContent) + 1
}

// Abre o modal de cadastro.
openButton.addEventListener('click', () => {
    resetForm()
    successMessage.classList.add('hidden')
    form.elements.deadline.min = getToday()
    modal.showModal()
})

// Fecha o modal.
closeButton.addEventListener('click', () => {
    modal.close()
})

// Valida ao sair do campo e ao corrigir um erro.
fields.forEach((field) => {
    field.addEventListener('blur', () => {
        validateField(field)
    })

    field.addEventListener('input', () => {
        if (field.getAttribute('aria-invalid') === 'true') {
            validateField(field)
        }
    })
})

// Envio do formulário.
form.addEventListener('submit', (event) => {
    event.preventDefault()

    // map valida todos os campos, mesmo se algum estiver incorreto.
    const results = fields.map((field) => validateField(field))
    const isValid = results.every(Boolean)

    if (!isValid) {
        const firstInvalid = fields.find(
            (field) => field.getAttribute('aria-invalid') === 'true'
        )

        firstInvalid.focus()
        return
    }

    saveButton.disabled = true

    try {
        const project = Object.fromEntries(new FormData(form))

        Object.keys(project).forEach((key) => {
            project[key] = project[key].trim()
        })

        addProject(project)
        modal.close()

        successMessage.textContent =
            `Projeto "${project.name}" cadastrado com sucesso!`

        successMessage.classList.remove('hidden')
        resetForm()
    } finally {
        saveButton.disabled = false
    }
})

// ========================================
// SIDEBAR MOBILE
// ========================================

const sidebar = document.querySelector('#sidebar')
const menuButton = document.querySelector('#menu-button')
const sidebarOverlay = document.querySelector('#sidebar-overlay')
const desktopScreen = window.matchMedia('(min-width: 64rem)')

// No celular, impede que links da sidebar fechada recebam foco.
sidebar.inert = !desktopScreen.matches

function toggleSidebar(open) {
    sidebar.classList.toggle('-translate-x-full', !open)
    sidebarOverlay.classList.toggle('hidden', !open)
    sidebar.inert = !desktopScreen.matches && !open

    menuButton.setAttribute('aria-expanded', String(open))
    menuButton.setAttribute(
        'aria-label',
        open ? 'Fechar menu' : 'Abrir menu'
    )

    document.body.classList.toggle('overflow-hidden', open)

    if (open) {
        sidebar.querySelector('a').focus()
    }
}

// Alterna entre abrir e fechar.
menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true'
    toggleSidebar(!isOpen)
})

// Fecha ao clicar no fundo.
sidebarOverlay.addEventListener('click', () => {
    toggleSidebar(false)
    menuButton.focus()
})

// Fecha ao escolher um link no celular.
sidebar.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        if (!desktopScreen.matches) {
            toggleSidebar(false)
            menuButton.focus()
        }
    })
})

// Ajusta o estado ao mudar entre desktop e mobile.
desktopScreen.addEventListener('change', () => {
    toggleSidebar(false)
})

// ========================================
// DROPDOWN DO USUÁRIO
// ========================================

const userArea = document.querySelector('#user-area')
const userButton = document.querySelector('#user-button')
const userDropdown = document.querySelector('#user-dropdown')

function toggleDropdown(open) {
    userDropdown.classList.toggle('hidden', !open)
    userButton.setAttribute('aria-expanded', String(open))
}

userButton.addEventListener('click', () => {
    const isOpen = userButton.getAttribute('aria-expanded') === 'true'
    toggleDropdown(!isOpen)
})

// Fecha ao clicar fora.
document.addEventListener('click', (event) => {
    if (!userArea.contains(event.target)) {
        toggleDropdown(false)
    }
})

// Fecha quando o foco sai da área do usuário.
userArea.addEventListener('focusout', (event) => {
    if (!userArea.contains(event.relatedTarget)) {
        toggleDropdown(false)
    }
})

// Esc fecha os menus.
// O dialog já possui seu próprio fechamento com Esc.
document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || modal.open) return

    if (menuButton.getAttribute('aria-expanded') === 'true') {
        toggleSidebar(false)
        menuButton.focus()
    }

    if (userButton.getAttribute('aria-expanded') === 'true') {
        toggleDropdown(false)
        userButton.focus()
    }
})