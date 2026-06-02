import { execFileSync } from 'node:child_process'
import { copyFileSync, cpSync, existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const distDir = path.join(repoRoot, 'dist')

if (!existsSync(distDir)) {
  throw new Error('dist directory not found. Run "npm run build" first.')
}

const run = (command, args, cwd) => {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
  })
}

const getOutput = (command, args, cwd) =>
  execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
  }).trim()

const remoteUrl = getOutput('git', ['remote', 'get-url', 'origin'], repoRoot)
const userName = getOutput('git', ['config', 'user.name'], repoRoot)
const userEmail = getOutput('git', ['config', 'user.email'], repoRoot)
const tempDir = mkdtempSync(path.join(tmpdir(), 'business-dashboard-gh-pages-'))

const hasRemoteBranch = (() => {
  try {
    execFileSync('git', ['ls-remote', '--exit-code', '--heads', 'origin', 'gh-pages'], {
      cwd: repoRoot,
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
})()

if (hasRemoteBranch) {
  run('git', ['clone', '--branch', 'gh-pages', '--single-branch', remoteUrl, tempDir], repoRoot)
} else {
  run('git', ['init'], tempDir)
  run('git', ['checkout', '--orphan', 'gh-pages'], tempDir)
  run('git', ['remote', 'add', 'origin', remoteUrl], tempDir)
}

run('git', ['config', 'user.name', userName], tempDir)
run('git', ['config', 'user.email', userEmail], tempDir)

for (const entry of readdirSync(tempDir)) {
  if (entry === '.git') continue
  rmSync(path.join(tempDir, entry), { recursive: true, force: true })
}

cpSync(distDir, tempDir, { recursive: true })

const indexPath = path.join(tempDir, 'index.html')
const notFoundPath = path.join(tempDir, '404.html')

if (existsSync(indexPath) && !existsSync(notFoundPath)) {
  copyFileSync(indexPath, notFoundPath)
}

writeFileSync(path.join(tempDir, '.nojekyll'), '')

run('git', ['add', '-A'], tempDir)

const status = getOutput('git', ['status', '--porcelain'], tempDir)

if (!status) {
  console.log('gh-pages branch is already up to date.')
} else {
  run('git', ['commit', '-m', 'Deploy GitHub Pages'], tempDir)
  run('git', ['push', '--force', 'origin', 'gh-pages'], tempDir)
  console.log('Successfully deployed dist to gh-pages branch.')
}
