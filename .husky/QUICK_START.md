# Git Hooks Quick Start

## 🎯 What Happens on Push?

### Automatic Checks (in order)

1. ✅ **ESLint** - Code quality
2. ✅ **TypeScript** - Type safety
3. ⚡ **Unit Tests** - Functionality (optional)
4. 🎭 **E2E Tests** - Browser tests (main branch only)

## 🚀 Common Commands

### Regular Push (with all checks)

```bash
git push
```

### Skip Unit Tests (if pre-existing failures)

```bash
SKIP_TESTS=1 git push
```

### Skip E2E Tests (faster push)

```bash
SKIP_E2E=1 git push
```

### Skip Both Tests

```bash
SKIP_TESTS=1 SKIP_E2E=1 git push
```

### Bypass ALL Checks (emergency only)

```bash
git push --no-verify
```

## 📊 Understanding Test Failures

### Pre-Existing Test Failures

If you see many test failures that aren't related to your changes:

```bash
# Push with tests skipped
SKIP_TESTS=1 git push

# But make sure to test your changes manually!
npm run test -- --watch  # Test your specific files
npm run e2e              # Run E2E tests
```

### Your Changes Broke Tests

If tests fail due to your changes:

1. Fix the tests
2. Run tests locally: `npm test`
3. Push again

## 🎯 Best Practices

### Daily Development

```bash
# 1. Write code
# 2. Test locally
npm test
npm run e2e  # occasionally

# 3. Push (skip unit tests if needed)
SKIP_TESTS=1 git push
```

### Before Merging to Main

```bash
# Run all tests
npm run lint
npm run type-check
npm test
npm run e2e

# Push to main (all checks enabled)
git push origin main
```

## 🔧 Troubleshooting

### Hook Not Running?

```bash
npm run prepare
chmod +x .husky/pre-push
```

### Tests Too Slow?

Skip them and run manually:

```bash
SKIP_TESTS=1 git push
npm test  # Run separately
```

### Need to Push Urgently?

```bash
git push --no-verify  # Use sparingly!
```

## 📝 Current Project Status

**Note**: The project currently has some pre-existing test failures. The hooks are configured to allow skipping these tests while you work on your features.

**Always test your own changes** even if you skip the automated tests:

```bash
# Test only your changed files
npm test -- src/your/changed/file.test.ts

# Or run specific test suites
npm run test:unit
npm run test:integration
npm run e2e
```

## 💡 Tips

- **Feature Branches**: E2E tests auto-skip (they're slow)
- **Main Branch**: All tests run (protects production)
- **Emergency**: Use `--no-verify` only in emergencies
- **Pre-commit**: Already runs linting on staged files automatically

## 🎓 Learn More

See [README.md](./.husky/README.md) for complete documentation.
