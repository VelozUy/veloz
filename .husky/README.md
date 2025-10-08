# Git Hooks with Husky

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks for automated quality checks.

## Configured Hooks

### Pre-Commit Hook

Runs before every commit:

- ✅ **lint-staged**: Formats and lints only staged files (Prettier + ESLint)
- ✅ **Theme Check**: Validates no hardcoded colors are used

**Files**: `.husky/pre-commit`

### Pre-Push Hook (NEW)

Runs before every push:

- ✅ **ESLint**: Full codebase linting
- ✅ **Type Check**: TypeScript validation
- ✅ **Unit Tests**: Jest unit tests
- ✅ **E2E Tests**: Playwright tests (on main/master/develop branches only)

**Files**: `.husky/pre-push`

## How It Works

### Pre-Push Behavior

#### On Main/Master/Develop Branches

**All checks run** (including E2E tests):

```bash
git push origin main
# Runs: lint → type-check → tests → e2e tests ✅
```

#### On Feature Branches

**Fast checks only** (skips E2E tests to save time):

```bash
git push origin feature/my-feature
# Runs: lint → type-check → tests ⚡
# Skips: e2e tests
```

## Customization Options

### Skip E2E Tests

If you need to skip E2E tests even on main branches:

```bash
SKIP_E2E=1 git push
```

### Force E2E Tests on Feature Branch

To run E2E tests on a feature branch:

```bash
SKIP_E2E=0 git push
```

### Skip All Pre-Push Checks (Not Recommended)

Only use this in emergencies:

```bash
git push --no-verify
```

⚠️ **Warning**: This bypasses all quality checks!

## Manual Testing

### Test Pre-Commit Hook

```bash
# Stage some files
git add .

# Run the hook manually
.husky/pre-commit
```

### Test Pre-Push Hook

```bash
# Run the hook manually (doesn't actually push)
.husky/pre-push
```

## Hook Scripts

### Pre-Push Check Sequence

1. **Linting** (~10-30s)
   - Runs ESLint on entire codebase
   - Fails if linting errors found
   - Suggest: `npm run lint:fix`

2. **Type Check** (~5-15s)
   - Validates TypeScript types
   - Fails if type errors found
   - Fix: Resolve TypeScript errors

3. **Unit Tests** (~5-10s)
   - Runs Jest test suite
   - Fails if tests fail
   - Fix: Resolve failing tests

4. **E2E Tests** (~30-60s, conditional)
   - Runs Playwright tests
   - Only on main/master/develop branches
   - Fails if E2E tests fail
   - Skip: Use `SKIP_E2E=1` flag

## Troubleshooting

### Hook Not Running

If the hook doesn't run, reinstall Husky:

```bash
npm run prepare
```

### Hook Permission Denied

Make the hook executable:

```bash
chmod +x .husky/pre-push
```

### Tests Failing

Run tests manually to debug:

```bash
npm run lint        # Check linting
npm run type-check  # Check types
npm test            # Run unit tests
npm run e2e         # Run E2E tests
```

### Slow Pre-Push

- E2E tests take 30-60 seconds
- Only run on main branches by default
- Use `SKIP_E2E=1` to skip if needed
- Consider running `npm run e2e` manually before pushing to main

## Development Workflow

### Recommended Workflow

1. **While developing** (per commit):

   ```bash
   git add .
   git commit -m "feat: add new feature"
   # Pre-commit runs: lint-staged + theme check ✅
   ```

2. **Before pushing** (per push):

   ```bash
   git push origin feature/my-feature
   # Pre-push runs: lint + type-check + tests ✅
   # E2E tests skipped on feature branch ⚡
   ```

3. **Before merging to main**:

   ```bash
   # Run E2E tests manually
   npm run e2e

   # Then push
   git push origin main
   # Pre-push runs: lint + type-check + tests + e2e ✅
   ```

### CI/CD Integration

These hooks complement (not replace) CI/CD checks:

- **Local hooks**: Catch issues early
- **CI/CD**: Final verification + deployment

## Customizing Hooks

### Edit Pre-Push Hook

Edit `.husky/pre-push` to:

- Add more checks
- Change branch logic
- Adjust error messages

### Add New Hook

Create new hook file:

```bash
echo '#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Your hook logic here
' > .husky/pre-merge-commit

chmod +x .husky/pre-merge-commit
```

## Performance Tips

### Speed Up Checks

1. **Use lint-staged** (already configured):
   - Only lints staged files on commit
   - Much faster than full codebase lint

2. **Skip E2E on feature branches** (already configured):
   - Saves 30-60 seconds per push
   - Run manually when needed

3. **Use test caching**:
   - Jest caches test results
   - TypeScript incremental compilation

4. **Optimize imports**:
   - Reduce unnecessary imports
   - Use code splitting

## Team Collaboration

### Onboarding New Developers

New team members automatically get hooks after:

```bash
git clone <repo>
npm install  # Runs 'npm run prepare' → installs Husky
```

### Sharing Hook Updates

Hook files are version controlled:

```bash
git add .husky/
git commit -m "chore: update pre-push hook"
git push
```

All team members get updates on next `git pull`.

## FAQ

**Q: Can I bypass the hooks?**  
A: Use `--no-verify` flag, but only in emergencies.

**Q: Why are E2E tests skipped on feature branches?**  
A: To speed up development. Run them manually with `npm run e2e` before merging.

**Q: How do I disable hooks temporarily?**  
A: Set `HUSKY=0` environment variable:

```bash
HUSKY=0 git push
```

**Q: Pre-push is too slow. What can I do?**  
A: Use `SKIP_E2E=1` to skip E2E tests, or push to a feature branch.

**Q: Can I customize which tests run?**  
A: Yes! Edit `.husky/pre-push` to customize the checks.

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)

## Support

If you encounter issues with Git hooks:

1. Check this README
2. Run hooks manually to debug
3. Check `.husky/` directory exists
4. Verify hooks are executable (`ls -la .husky/`)
5. Reinstall: `npm run prepare`
