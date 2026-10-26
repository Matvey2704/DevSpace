// Проверка словарей: ключи ru/en совпадают, все t('...') в коде существуют, нет неиспользуемых ключей.
// Запуск: node scripts/check-i18n.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

function keysOf(file) {
  const src = readFileSync(file, 'utf8')
  return [...src.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1])
}
const ru = keysOf('lib/i18n/ru.ts')
const en = keysOf('lib/i18n/en.ts')
const ruSet = new Set(ru)
const enSet = new Set(en)

const problems = []
for (const k of ru) if (!enSet.has(k)) problems.push(`нет в en.ts: ${k}`)
for (const k of en) if (!ruSet.has(k)) problems.push(`нет в ru.ts: ${k}`)

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (['node_modules', '.next', 'generated', 'i18n'].includes(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(tsx?|mjs)$/.test(p)) out.push(p)
  }
  return out
}

const files = ['app', 'components', 'lib'].flatMap((d) => walk(d))
const used = new Set()
// допускаем плюральные формы и динамические ключи вида `prefix.${x}`
const hasKey = (k) => ruSet.has(k) || ['one', 'few', 'many', 'other'].some((s) => ruSet.has(`${k}_${s}`))
const prefixes = new Set()

for (const f of files) {
  const src = readFileSync(f, 'utf8')
  for (const m of src.matchAll(/\bt\(\s*(['`])([^'`]+)\1/g)) {
    const key = m[2]
    if (key.includes('${')) {
      prefixes.add(key.split('${')[0])
      continue
    }
    used.add(key)
    if (!hasKey(key)) problems.push(`${f}: неизвестный ключ ${key}`)
  }
  for (const m of src.matchAll(/'([a-zA-Z]+(?:\.[\w-]+)+)'/g)) if (ruSet.has(m[1])) used.add(m[1])
}

const unused = ru.filter((k) => {
  if (k.startsWith('serverError.')) return false
  const base = k.replace(/_(one|few|many|other)$/, '')
  if (used.has(k) || used.has(base)) return false
  return ![...prefixes].some((p) => k.startsWith(p))
})
for (const k of unused) problems.push(`не используется: ${k}`)

if (problems.length) {
  console.error(problems.join('\n'))
  process.exit(1)
}
console.log(`i18n OK: ${ru.length} ключей, ru и en совпадают, неизвестных и неиспользуемых ключей нет`)
