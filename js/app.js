// Atalho para selecionar elementos da página.
const $ = (selector) => document.querySelector(selector)

// ========================================
// PROJETOS E PESQUISA
// ========================================

const projects = [
  {
    name: 'Plataforma TechFlow',
    owner: 'Artur',
    category: 'Desenvolvimento',
    priority: 'Alta',
    deadline: '2026-11-30',
    description: 'Plataforma para organizar projetos, equipes e indicadores.',
    progress: 65,
  },
  {
    name: 'Nova identidade visual',
    owner: 'Bruno',
    category: 'Design',
    priority: 'Média',
    deadline: '2026-11-15',
    description: 'Atualização das cores, tipografia e componentes da marca.',
    progress: 40,
  },
  {
    name: 'Campanha de lançamento',
    owner: 'João Pedro',
    category: 'Marketing',
    priority: 'Alta',
    deadline: '2026-11-20',
    description: 'Planejamento de conteúdo para divulgar a plataforma.',
    progress: 25,
  },
  {
    name: 'Migração para a nuvem',
    owner: 'Arthur',
    category: 'Infraestrutura',
    priority: 'Média',
    deadline: '2026-11-10',
    description: 'Migração dos serviços para um ambiente mais disponível.',
    progress: 80,
  },
  {
    name: 'Landing page',
    owner: 'Bruno',
    category: 'Design',
    priority: 'Baixa',
    deadline: '2026-10-01',
    description: 'Página de apresentação dos serviços da empresa.',
    progress: 100,
  },
  {
    name: 'Revisão de acessos',
    owner: 'Artur',
    category: 'Segurança',
    priority: 'Alta',
    deadline: '2026-10-03',
    description: 'Revisão das permissões e dos acessos da equipe.',
    progress: 100,
  },
]

// Ignora acentos e diferenças entre maiúsculas e minúsculas.
function normalize(text) {
  return text.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

// Uma única função cria os cards iniciais e os novos.
function createCard(project, index) {
  const card = document.createElement('article')

  card.className =
    'group flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800'

  // Tamanhos diferentes exigidos pelo CP.
  if (index === 0) card.classList.add('md:row-span-2')
  if (index === 3) card.classList.add('xl:col-span-2')

  // Estrutura fixa: os dados do usuário entram com textContent.
  card.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
      <span data-category class="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"></span>
      <span data-status class="text-slate-500 dark:text-slate-400"></span>
    </div>

    <h3 data-name class="mt-4 break-words text-lg font-bold transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"></h3>

    <p data-description class="mt-2 break-words text-sm text-slate-500 dark:text-slate-400"></p>

    <p data-priority class="mt-4 text-xs text-slate-500 dark:text-slate-400"></p>

    <div class="mt-auto pt-5">
      <div class="flex items-center justify-between text-sm">
        <span>Progresso</span>
        <span data-percent></span>
      </div>

      <div data-progress role="progressbar" aria-valuemin="0" aria-valuemax="100" class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div data-bar class="h-full rounded-full bg-indigo-500"></div>
      </div>

      <div class="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span data-owner class="break-words"></span>
        <span data-deadline></span>
      </div>
    </div>
  `

  const texts = {
    category: project.category,
    status: project.progress === 100 ? 'Concluído' : 'Em andamento',
    name: project.name,
    description: project.description,
    priority: `Prioridade: ${project.priority}`,
    percent: `${project.progress}%`,
    owner: `Responsável: ${project.owner}`,
    deadline: `Prazo: ${project.deadline.split('-').reverse().join('/')}`,
  }

  for (const [key, value] of Object.entries(texts)) {
    card.querySelector(`[data-${key}]`).textContent = value
  }

  card.querySelector('[data-bar]').style.width = `${project.progress}%`

  const progress = card.querySelector('[data-progress]')
  progress.setAttribute('aria-valuenow', project.progress)
  progress.setAttribute('aria-label', `Progresso de ${project.name}`)

  return card
}

// Atualiza a lista conforme a pesquisa.
function renderProjects() {
  const list = $('#project-list')
  const term = normalize($('#search').value)
  let count = 0

  list.replaceChildren()

  projects.forEach((project, index) => {
    const text = normalize(Object.values(project).join(' '))

    if (text.includes(term)) {
      list.append(createCard(project, index))
      count++
    }
  })

  $('#empty').classList.toggle('hidden', count > 0)

  $('#active-count').textContent =
    projects.filter((project) => project.progress < 100).length
}

$('#search').addEventListener('input', renderProjects)
renderProjects()

// ========================================
// MODAL E VALIDAÇÃO
// ========================================

const modal = $('#modal')
const form = $('#project-form')
const fields = Array.from(form.elements).filter((field) => field.name)

// Data local no formato usado pelo campo date.
function today() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

$('#new-project').addEventListener('click', () => {
  form.reset()
  $('#success').classList.add('hidden')

  fields.forEach((field) => {
    field.classList.remove('border-red-500', 'border-emerald-500')
    field.classList.add('border-slate-400')
    field.removeAttribute('aria-invalid')
    $(`#${field.name}-error`).textContent = ''
  })

  $('#deadline').min = today()
  modal.showModal()
})

$('#close-modal').addEventListener('click', () => modal.close())

// Retorna true quando o campo está válido.
function validate(field) {
  const value = field.value.trim()
  let error = ''

  if (!value) {
    error = 'Preencha este campo.'
  } else if (field.minLength > 0 && value.length < field.minLength) {
    error = `Digite pelo menos ${field.minLength} caracteres.`
  } else if (field.name === 'deadline' && value < today()) {
    error = 'Escolha hoje ou uma data futura.'
  }

  field.classList.remove(
    'border-slate-400',
    'border-red-500',
    'border-emerald-500'
  )

  field.classList.add(error ? 'border-red-500' : 'border-emerald-500')
  field.setAttribute('aria-invalid', String(Boolean(error)))
  $(`#${field.name}-error`).textContent = error

  return !error
}

fields.forEach((field) => {
  field.addEventListener('blur', () => validate(field))

  field.addEventListener('input', () => {
    if (field.hasAttribute('aria-invalid')) validate(field)
  })
})

form.addEventListener('submit', (event) => {
  event.preventDefault()

  const valid = fields.map(validate).every(Boolean)

  if (!valid) {
    fields.find((field) => field.getAttribute('aria-invalid') === 'true').focus()
    return
  }

  const button = $('#save-project')
  button.disabled = true

  try {
    const project = Object.fromEntries(new FormData(form))

    for (const key in project) {
      project[key] = project[key].trim()
    }

    project.progress = 0
    projects.push(project)
    renderProjects()
    modal.close()

    $('#success').textContent = `Projeto "${project.name}" cadastrado!`
    $('#success').classList.remove('hidden')
  } finally {
    button.disabled = false
  }
})

// ========================================
// SIDEBAR E DROPDOWN
// ========================================

const sidebar = $('#sidebar')
const menuButton = $('#menu-button')
const desktop = window.matchMedia('(min-width: 64rem)')

function setSidebar(open) {
  sidebar.classList.toggle('-translate-x-full', !open)
  $('#overlay').classList.toggle('hidden', !open)
  document.body.classList.toggle('overflow-hidden', open)
  menuButton.setAttribute('aria-expanded', String(open))

  // Impede foco no menu quando ele está fechado no celular.
  sidebar.inert = !desktop.matches && !open

  if (open) sidebar.querySelector('a').focus()
}

setSidebar(false)

menuButton.addEventListener('click', () => {
  setSidebar(menuButton.getAttribute('aria-expanded') !== 'true')
})

$('#overlay').addEventListener('click', () => {
  setSidebar(false)
  menuButton.focus()
})

sidebar.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    if (!desktop.matches) {
      setSidebar(false)
      menuButton.focus()
    }
  })
})

desktop.addEventListener('change', () => setSidebar(false))

function setDropdown(open) {
  $('#user-dropdown').classList.toggle('hidden', !open)
  $('#user-button').setAttribute('aria-expanded', String(open))
}

$('#user-button').addEventListener('click', () => {
  const open = $('#user-button').getAttribute('aria-expanded') === 'true'
  setDropdown(!open)
})

document.addEventListener('click', (event) => {
  if (!$('#user-area').contains(event.target)) setDropdown(false)
})

$('#user-area').addEventListener('focusout', (event) => {
  if (!$('#user-area').contains(event.relatedTarget)) setDropdown(false)
})

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || modal.open) return

  if (menuButton.getAttribute('aria-expanded') === 'true') {
    setSidebar(false)
    menuButton.focus()
  }

  if ($('#user-button').getAttribute('aria-expanded') === 'true') {
    setDropdown(false)
    $('#user-button').focus()
  }
})

// ========================================
// TEMAS E LOCALSTORAGE
// ========================================

const theme = $('#theme')
const system = window.matchMedia('(prefers-color-scheme: dark)')

theme.value = 'system'

try {
  const saved = localStorage.getItem('techflow-theme')

  if (['light', 'dark', 'system'].includes(saved)) {
    theme.value = saved
  }
} catch {
  // Mantém Sistema se o armazenamento estiver indisponível.
}

function applyTheme() {
  const dark =
    theme.value === 'dark' ||
    (theme.value === 'system' && system.matches)

  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

theme.addEventListener('change', () => {
  applyTheme()

  try {
    localStorage.setItem('techflow-theme', theme.value)
  } catch {
    // A troca de tema continua funcionando nesta sessão.
  }
})

system.addEventListener('change', applyTheme)
applyTheme()