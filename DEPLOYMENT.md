# Deployment Guide for AI/ML Portfolio

This document outlines the deployment process for the specialized AI/ML portfolio website.

## Overview

The portfolio is optimized for technical content including:
- AI/ML project showcases
- Research publications and papers
- Technical artifacts and diagrams
- Interactive demonstrations
- Performance optimizations
- Accessibility features

## Automated Deployment

### GitHub Actions Workflow

The deployment is automated using GitHub Actions (`.github/workflows/deploy.yml`):

#### Triggers
- Push to `main` or `master` branch
- Pull requests (for testing)
- Manual workflow dispatch

#### Build Process
1. **Environment Setup**
   - Node.js 18 with npm caching
   - Python 3.9 for build tools
   - Dependency caching for faster builds

2. **Content Validation**
   - Validates all JSON data files
   - Checks technical artifacts integrity
   - Verifies required images exist

3. **Image Optimization**
   - Optimizes SVG technical diagrams
   - Compresses images for web delivery
   - Generates fallback images

4. **Performance Optimization**
   - Minifies CSS and JavaScript files
   - Creates combined asset files
   - Generates service worker for caching

5. **Quality Assurance**
   - HTML validation and structure checks
   - Performance testing and metrics
   - Accessibility feature verification
   - File size analysis and warnings

6. **Deployment**
   - Deploys to GitHub Pages (production)
   - Uploads build artifacts
   - Generates deployment report

## Manual Deployment

### Prerequisites

```bash
# Install Python dependencies
pip install pillow beautifulsoup4 requests

# Install Node.js dependencies (if package.json exists)
npm install
```

### Build Process

1. **Validate Content**
   ```bash
   # Check JSON files
   python3 -m json.tool assets/data/*.json
   
   # Verify required files exist
   ls assets/data/{ai-product-projects,ml-engineering-projects,research-projects,publications,technical-artifacts,skills}.json
   ```

2. **Optimize Images**
   ```bash
   # Run image optimization
   find assets/images -name "*.svg" -exec echo "Optimizing {}" \;
   ```

3. **Build Performance Optimizations**
   ```bash
   # Run minification
   python3 build-tools/minify.py
   
   # Verify outputs
   ls assets/dist/combined.min.{css,js}
   ```

4. **Run Quality Checks**
   ```bash
   # Performance test
   python3 test-performance.py
   
   # Accessibility test (open in browser)
   open test-accessibility.html
   ```

### Deployment Targets

#### GitHub Pages
- **URL**: `https://[username].github.io/[repository]`
- **Branch**: Deployed from `gh-pages` branch
- **Custom Domain**: Configure in repository settings

#### Other Platforms

**Netlify**
```bash
# Build command
python3 build-tools/minify.py

# Publish directory
./

# Environment variables
NODE_VERSION=18
PYTHON_VERSION=3.9
```

**Vercel**
```json
{
  "buildCommand": "python3 build-tools/minify.py",
  "outputDirectory": "./",
  "framework": null
}
```

**AWS S3 + CloudFront**
```bash
# Sync to S3
aws s3 sync . s3://your-bucket --exclude ".*" --exclude "*.md" --exclude "test-*"

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## Performance Optimizations

### Implemented Optimizations
- **CSS Minification**: 25-40% size reduction
- **JavaScript Minification**: 20-40% size reduction  
- **Image Optimization**: Lazy loading + fallbacks
- **Service Worker**: Offline caching strategy
- **Critical CSS**: Above-the-fold inlining
- **Resource Hints**: Preloading critical assets

### Performance Metrics
- **First Contentful Paint**: < 1.8s (target)
- **Largest Contentful Paint**: < 2.5s (target)
- **Cumulative Layout Shift**: < 0.1 (target)
- **First Input Delay**: < 100ms (target)

## Content Management

### Adding New Projects

1. **AI Product Projects** (`assets/data/ai-product-projects.json`)
   ```json
   {
     "id": "unique-id",
     "title": "Project Name",
     "description": "Brief description",
     "category": "ai-product",
     "technologies": ["React", "Python", "ML"],
     "images": ["path/to/image.jpg"],
     "links": {
       "demo": "https://demo.url",
       "github": "https://github.com/repo"
     }
   }
   ```

2. **Research Projects** (`assets/data/research-projects.json`)
   ```json
   {
     "id": "research-id", 
     "title": "Research Title",
     "description": "Research description",
     "category": "research",
     "methods": ["Method 1", "Method 2"],
     "results": "Key findings",
     "publications": ["DOI or URL"]
   }
   ```

3. **Technical Artifacts** (`assets/data/technical-artifacts.json`)
   ```json
   {
     "id": "artifact-id",
     "title": "Artifact Name", 
     "type": "diagram|demo|code-repository|prd",
     "description": "Description",
     "url": "https://link.url",
     "images": ["path/to/diagram.svg"]
   }
   ```

### Adding Images

1. **Technical Diagrams**: Place in `assets/images/diagrams/`
2. **Project Screenshots**: Place in `assets/images/projects/[project-name]/`
3. **Research Plots**: Place in `assets/images/research/`
4. **Wireframes**: Place in `assets/images/wireframes/`

### Content Guidelines

- **Images**: Use SVG for diagrams, optimize file sizes
- **Alt Text**: Provide descriptive alt text for accessibility
- **Links**: Ensure all external links are valid
- **JSON**: Validate JSON syntax before committing

## Monitoring and Maintenance

### Performance Monitoring
- Use browser DevTools for Core Web Vitals
- Monitor Lighthouse scores regularly
- Check service worker functionality

### Content Updates
- Review and update project information quarterly
- Add new publications and research as available
- Update technical skills and technologies

### Security
- Regularly update dependencies
- Monitor for security vulnerabilities
- Review external links and resources

## Troubleshooting

### Common Issues

**Build Failures**
```bash
# Check JSON syntax
python3 -m json.tool assets/data/file.json

# Verify file permissions
ls -la assets/data/

# Check Python dependencies
pip list | grep -E "pillow|beautifulsoup4|requests"
```

**Performance Issues**
```bash
# Check asset sizes
du -sh assets/dist/*

# Verify minification
ls -la assets/dist/combined.min.*

# Test service worker
open browser DevTools > Application > Service Workers
```

**Accessibility Issues**
```bash
# Run accessibility audit
open test-accessibility.html

# Check ARIA labels
grep -r "aria-" index.html
```

### Support

For deployment issues:
1. Check GitHub Actions logs
2. Verify all required files exist
3. Test locally before pushing
4. Review deployment report

## Environment Variables

### GitHub Actions Secrets
- `GITHUB_TOKEN`: Automatically provided
- Custom domain: Set in workflow file

### Optional Configuration
- **Analytics**: Add tracking codes to HTML
- **CDN**: Configure for global content delivery
- **Monitoring**: Set up uptime monitoring

## Rollback Procedure

If deployment issues occur:

1. **Immediate Rollback**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   ```

2. **Selective Rollback**
   ```bash
   # Revert specific files
   git checkout HEAD~1 -- assets/data/problematic-file.json
   git commit -m "Rollback problematic changes"
   git push origin main
   ```

3. **Emergency Maintenance**
   - Disable GitHub Pages temporarily
   - Fix issues locally
   - Re-enable after verification

## Performance Benchmarks

### Target Metrics
- **Load Time**: < 3 seconds on 3G
- **Bundle Size**: < 500KB total assets
- **Accessibility**: WCAG 2.1 AA compliance
- **SEO**: 90+ Lighthouse score

### Optimization Checklist
- [ ] Images optimized and lazy-loaded
- [ ] CSS and JS minified
- [ ] Service worker implemented
- [ ] Critical CSS inlined
- [ ] Accessibility features enabled
- [ ] Performance monitoring active