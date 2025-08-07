# Publishing Guide

This guide explains how to publish new versions of `eslint-plugin-undefined-css-classes` to npm.

## Automated Publishing

This repository is configured with GitHub Actions to automatically publish to npm in two ways:

### 1. Auto-publish on Version Change (Recommended)

When you bump the version in `package.json` and push to main/master, the package will automatically be published if CI passes:

```bash
# Patch release (0.1.2 -> 0.1.3)
npm run release

# Minor release (0.1.2 -> 0.2.0)
npm run release:minor

# Major release (0.1.2 -> 1.0.0)
npm run release:major

# Beta release (0.1.2 -> 0.1.3-beta.0)
npm run release:beta
```

These commands will:
1. Bump the version in package.json
2. Create a git commit and tag
3. Push to GitHub
4. Trigger CI and auto-publish if tests pass

### 2. Tag-based Publishing

You can also manually create and push a version tag:

```bash
# Update package.json version manually
npm version 0.1.3 --no-git-tag-version

# Commit the change
git add package.json package-lock.json
git commit -m "chore: bump version to 0.1.3"

# Create and push tag
git tag v0.1.3
git push origin main
git push origin v0.1.3
```

## Setup Requirements

### NPM Token

To enable automated publishing, you need to add an NPM token to your GitHub repository:

1. **Generate NPM Token:**
   - Log in to [npmjs.com](https://www.npmjs.com)
   - Go to Account Settings → Access Tokens
   - Click "Generate New Token"
   - Choose "Automation" type (recommended for CI/CD)
   - Copy the token

2. **Add to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

### Permissions

Ensure you have:
- Write access to the npm package
- Admin access to the GitHub repository (to add secrets)

## Manual Publishing

If you need to publish manually (not recommended):

```bash
# Ensure you're logged in to npm
npm login

# Run tests and lint
npm test
npm run lint

# Publish to npm
npm publish

# For beta/pre-release versions
npm publish --tag beta
```

## Workflow Files

The publishing automation is handled by these workflows:

- `.github/workflows/auto-publish.yml` - Automatic publishing on version changes and tags
- `.github/workflows/publish.yml` - Manual publishing workflow (can be triggered from GitHub Actions tab)
- `.github/workflows/ci.yml` - CI tests that must pass before publishing

## Version Strategy

- **Patch releases** (x.x.X): Bug fixes, documentation updates
- **Minor releases** (x.X.x): New features, backwards-compatible changes
- **Major releases** (X.x.x): Breaking changes
- **Pre-releases** (x.x.x-beta.X): Beta features for testing

## Troubleshooting

### Publishing Fails

1. Check that `NPM_TOKEN` is set in GitHub secrets
2. Verify the token hasn't expired
3. Ensure the version isn't already published
4. Check CI tests are passing

### Version Already Exists

If you get an error that the version already exists:
1. Bump to a new version
2. Or unpublish the existing version (within 72 hours): `npm unpublish eslint-plugin-undefined-css-classes@x.x.x`

### Workflow Not Triggering

Ensure:
- You're pushing to the main/master branch
- The version in package.json actually changed
- CI tests pass successfully

## Best Practices

1. Always test locally before releasing
2. Update CHANGELOG.md with notable changes
3. Use semantic versioning
4. Create GitHub releases for major/minor versions
5. Test beta releases before stable releases for significant changes