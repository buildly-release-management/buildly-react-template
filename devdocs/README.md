# Developer Documentation (devdocs)

## 📋 **MANDATORY: All Development Changes Must Be Documented Here**

This directory contains documentation for all features, releases, fixes, and changes made to the Buildly React Template. **Every developer (AI and human) MUST document their changes here before deployment.**

## 📁 Directory Structure

```
devdocs/
├── README.md           # This file - documentation standards
├── features/           # New feature documentation
├── releases/           # Release notes and change logs
├── fixes/              # Bug fixes and patches
└── templates/          # Documentation templates
```

## 🚨 **CRITICAL: Pre-Deployment Requirements**

### **BEFORE EVERY DEPLOYMENT:**

1. **📝 Document Changes**: Create documentation in appropriate `devdocs/` folder
2. **🧪 Run Tests**: Execute `./scripts/test-deployment.sh`
3. **✅ Verify Build**: Ensure `yarn run build:prod` succeeds
4. **📋 Update Changelog**: Add entry to release documentation

### **MANDATORY TESTING CHECKLIST:**
```bash
# 1. Run comprehensive tests
./scripts/test-deployment.sh

# 2. Verify production build
yarn run build:prod

# 3. Test critical user flows
yarn run test:prod

# 4. Check for console errors
# (Manual testing in browser)
```

## 📖 Documentation Standards

### **When to Document:**
- ✅ **Every new feature** → `devdocs/features/`
- ✅ **Every bug fix** → `devdocs/fixes/`
- ✅ **Every release** → `devdocs/releases/`
- ✅ **API changes** → Relevant folder + API impact notes
- ✅ **Performance improvements** → `devdocs/features/performance/`
- ✅ **Security updates** → `devdocs/fixes/security/`

### **Documentation File Naming:**
```
YYYY-MM-DD-feature-name.md
YYYY-MM-DD-fix-issue-description.md
YYYY-MM-DD-release-vX.X.X.md
```

**Examples:**
- `2024-12-05-ai-enhanced-product-wizard.md`
- `2024-12-05-fix-insights-undefined-error.md`
- `2024-12-05-release-v1.0.4.md`

## 📝 Required Documentation Template

### **Every documentation file MUST include:**

```markdown
# [Feature/Fix/Release Name]

**Date**: YYYY-MM-DD
**Developer**: [Name/AI Assistant]
**Type**: [Feature/Fix/Release/Performance/Security]
**Impact**: [High/Medium/Low]

## Summary
Brief description of what was changed/added/fixed

## Changes Made
### Files Modified:
- `path/to/file1.js` - Description of changes
- `path/to/file2.js` - Description of changes

### Files Added:
- `path/to/newfile.js` - Purpose and functionality

### Files Deleted:
- `path/to/oldfile.js` - Reason for removal

## Testing Performed
- [ ] Unit tests passed
- [ ] Integration tests passed
- [ ] Manual testing completed
- [ ] Browser compatibility verified
- [ ] Performance impact assessed

## Deployment Notes
- Dependencies added/removed
- Environment variable changes
- Database migrations needed
- Breaking changes (if any)

## Rollback Plan
Instructions for reverting changes if issues occur

## Related Issues/PRs
Links to relevant issues, pull requests, or tickets
```

## 🤖 **AI Developer Guidelines**

### **For AI Assistants (like GitHub Copilot):**

1. **ALWAYS document before suggesting deployment**
2. **Create documentation file in appropriate devdocs folder**
3. **Include comprehensive testing instructions**
4. **Note any breaking changes or dependencies**
5. **Provide rollback instructions**

### **Documentation Reminder for AI:**
```
BEFORE suggesting deployment:
1. Create devdocs/[type]/YYYY-MM-DD-[description].md
2. List all modified files with descriptions
3. Include testing checklist
4. Note any environment changes
5. Remind human to run ./scripts/test-deployment.sh
```

## 👨‍💻 **Human Developer Guidelines**

### **Before Starting Work:**
1. Check existing documentation for context
2. Understand impact of planned changes
3. Plan testing strategy

### **During Development:**
1. Document decisions and changes as you work
2. Update relevant documentation files
3. Test incrementally

### **Before Deployment:**
1. Complete documentation in devdocs
2. Run full test suite
3. Verify all requirements met
4. Get code review (if team process)

## 🔄 **Change Management Process**

### **1. Planning Phase**
- Document planned changes in devdocs
- Identify potential impacts
- Plan testing approach

### **2. Development Phase**
- Implement changes
- Update documentation as you go
- Run incremental tests

### **3. Pre-Deployment Phase**
- Complete comprehensive documentation
- Run `./scripts/test-deployment.sh`
- Verify production build works
- Manual testing of critical paths

### **4. Deployment Phase**
- Deploy to staging first (if available)
- Monitor for issues
- Have rollback plan ready

### **5. Post-Deployment Phase**
- Monitor logs and error rates
- Update documentation with any issues found
- Document lessons learned

## 📊 **Quality Gates**

### **Documentation Quality Checklist:**
- [ ] All modified files listed with descriptions
- [ ] Testing checklist completed
- [ ] Impact assessment included
- [ ] Rollback plan documented
- [ ] Dependencies/environment changes noted
- [ ] Performance impact assessed
- [ ] Security implications considered

### **Testing Quality Gates:**
- [ ] `./scripts/test-deployment.sh` passes
- [ ] `yarn run build:prod` succeeds
- [ ] `yarn run test:prod` passes
- [ ] Manual testing of affected features
- [ ] Browser compatibility verified
- [ ] No console errors in critical paths

## 🚨 **Emergency Procedures**

### **If Issues Found Post-Deployment:**

1. **Immediate Assessment**
   - Document the issue in devdocs/fixes/
   - Assess severity and impact
   - Determine if rollback needed

2. **Quick Fix or Rollback**
   ```bash
   # For rollback
   git revert [commit-hash]
   yarn run build:prod
   # Deploy previous version
   
   # For quick fix
   # Make minimal changes
   ./scripts/test-deployment.sh
   # Deploy fix
   ```

3. **Post-Incident Documentation**
   - Update devdocs with root cause
   - Document prevention measures
   - Update testing procedures if needed

## 📚 **Documentation Templates**

See `devdocs/templates/` for:
- Feature documentation template
- Bug fix documentation template
- Release notes template
- Performance improvement template
- Security update template

## 🔍 **Compliance Verification**

### **Regular Audits Should Check:**
- All deployments have corresponding documentation
- Test results are documented
- Breaking changes are properly noted
- Rollback procedures are available
- Performance impacts are assessed

### **Automated Checks (Recommended):**
```bash
# Add to CI/CD pipeline
./scripts/verify-documentation.sh  # Check for required docs
./scripts/test-deployment.sh       # Run full test suite
```

## 💡 **Best Practices**

### **Documentation:**
- Write for future developers (including yourself)
- Include context and reasoning, not just what changed
- Use clear, descriptive language
- Include examples where helpful

### **Testing:**
- Test both happy path and edge cases
- Verify backwards compatibility
- Check performance impact
- Test error handling

### **Deployment:**
- Deploy during low-traffic periods when possible
- Monitor actively after deployment
- Have team member available for rollback if needed
- Communicate with stakeholders about significant changes

---

## ⚠️ **ENFORCEMENT NOTICE**

**This documentation process is MANDATORY for all developers.**

**Failure to document changes and run tests before deployment can result in:**
- Production issues
- Rollback requirements
- User experience degradation
- Security vulnerabilities

**Remember**: The extra 10 minutes spent on documentation and testing can save hours of incident response and user frustration.

---

**Questions?** Review this README and existing documentation examples before starting work.
