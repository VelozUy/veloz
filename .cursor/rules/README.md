# Cursor IDE Rules v1.7.33 - Updated Rules Documentation

## Overview

This directory contains comprehensive Cursor IDE rules updated for version 1.7.33, incorporating the latest features and best practices for optimal AI-assisted development.

## Rule Files

### 1. `cursor-ide-comprehensive.mdc`

**Purpose**: Comprehensive Cursor IDE rules covering all aspects of development
**Scope**: All development activities
**Features**:
Note: This rule is agent-requestable (not always applied) to keep context lean. See `core.mdc` for essentials.

- Enhanced tool selection strategy (8-step process)
- Latest Cursor 1.7.33 features and capabilities
- Advanced MCP tool integration
- Improved context management
- Enhanced error prevention and recovery

### 2. `design.mdc` (Updated)

**Purpose**: UI/UX design rules and best practices
**Scope**: Frontend development, design system, accessibility
**Updates**:

- Enhanced metadata with proper glob patterns
- Better integration with Cursor 1.7.33 features
- Improved tool descriptions with latest capabilities
- Enhanced performance with proper caching
- Migration guidance from legacy rules

### 3. `auto-mode.mdc` (New)

**Purpose**: Auto mode configuration and best practices
**Scope**: Automated development workflows
**Features**:

- Safety settings and guardrails configuration
- Enhanced auto mode workflow
- Performance optimization
- Error handling and recovery
- Migration from legacy auto mode

### 4. `tools-usage.mdc` (New)

**Purpose**: Comprehensive guide to Cursor IDE tools
**Scope**: Tool selection and optimization
**Features**:

- Enhanced search tools (codebase_search, file_search, grep_search)
- Advanced edit tools (edit_file, search_replace, MultiEdit)
- Run tools with monitoring
- MCP tool integration
- Performance optimization strategies

### 5. `team-collaboration.mdc` (New)

### 6. `core.mdc` (New)

**Purpose**: Minimal always-applied essentials (workflow, safety, quality gates)
**Scope**: All tasks
**Notes**: Kept concise to preserve context; larger guidance lives in comprehensive rule.
**Purpose**: Team collaboration and workflow management
**Scope**: Team development, rule management, quality standards
**Features**:

- Centralized rule system
- Team workflow integration
- Enhanced team features (Agent Autocomplete, Hooks System)
- Quality standards and security practices
- Rule templates and maintenance

## Key Updates for Cursor 1.7.33

### New Features Integrated

1. **Agent Autocomplete**: Context-aware suggestions with project patterns
2. **Hooks System**: Customizable behavior at runtime with event-driven architecture
3. **Team Rules**: Centralized rule management for team environments
4. **Enhanced Context Management**: Better context window utilization and memory management
5. **Advanced Error Handling**: Better error recovery and debugging capabilities

### Enhanced Tool Capabilities

- **Search Tools**: Improved semantic understanding and ranking
- **Edit Tools**: Better conflict resolution and validation
- **Run Tools**: Enhanced timeout handling and process management
- **MCP Tools**: 50+ official integrations with better error handling

### Migration from Legacy Rules

- **From .cursorrules to .cursor/rules/**: New directory structure
- **Enhanced Metadata**: Better rule descriptions and glob patterns
- **Improved Integration**: Better Cursor IDE integration
- **Performance**: Enhanced performance with proper caching

## Usage Guidelines

### Rule Application

- **Always Applied**: Core development rules (core.mdc)
- **Auto Attached**: Context-specific rules (design.mdc)
- **Agent Requested**: On-demand rules (tools-usage.mdc, auto-mode.mdc)
- **Manual**: Explicitly invoked rules (team-collaboration.mdc)

### Best Practices

1. **Start with Comprehensive Rules**: Use cursor-ide-comprehensive.mdc as foundation
2. **Add Context-Specific Rules**: Apply design.mdc for UI/UX work
3. **Use Auto Mode Carefully**: Follow auto-mode.mdc guidelines
4. **Optimize Tool Usage**: Leverage tools-usage.mdc for efficiency
5. **Maintain Team Standards**: Use team-collaboration.mdc for consistency

### Rule Maintenance

- **Regular Updates**: Keep rules current with Cursor IDE updates
- **Team Review**: Regular team review of rule effectiveness
- **Performance Monitoring**: Track rule usage and effectiveness
- **Continuous Improvement**: Iterate based on team feedback

## File Structure

```
.cursor/rules/
├── README.md                           # This documentation
├── cursor-ide-comprehensive.mdc        # Comprehensive (agent-requested)
├── design.mdc                          # UI/UX design rules (updated)
├── auto-mode.mdc                       # Auto mode configuration (new)
├── tools-usage.mdc                     # Tool usage guide (new)
├── team-collaboration.mdc              # Team collaboration rules (new)
└── core.mdc                            # Always-applied essentials (new)
```

## Migration Checklist

### From Legacy .cursorrules

- [ ] Create `.cursor/rules/` directory
- [ ] Convert existing rules to `.mdc` format
- [ ] Update rule metadata and descriptions
- [ ] Test new rule system
- [ ] Archive legacy rules
- [ ] Train team on new system

### Rule Validation

- [ ] Test all rules in development
- [ ] Validate rule effectiveness
- [ ] Check for conflicts between rules
- [ ] Ensure proper rule application
- [ ] Monitor performance impact

## Support and Maintenance

## Tool Name Mapping and Availability

- glob_file_search: filename search (use instead of file_search)
- grep: exact/regex search (use instead of grep_search)
- codebase_search: semantic search
- run_terminal_cmd: commands (use is_background for long-running)
- MCP tools: optional; if unavailable, use web_search as fallback

## Performance Guidance

- Keep `alwaysApply` rules short and high-signal.
- Prefer agent-requestable rules for long content and examples.
- Avoid broad `globs` that pull docs into context unnecessarily.

### Rule Updates

- **Version Control**: Track rule changes in Git
- **Team Review**: Regular team review of rules
- **Documentation**: Keep documentation current
- **Testing**: Validate rule changes

### Troubleshooting

- **Rule Conflicts**: Resolve conflicts between rules
- **Performance Issues**: Optimize rule performance
- **Integration Issues**: Fix Cursor IDE integration
- **Team Adoption**: Support team rule adoption

## Future Enhancements

### Planned Updates

- **Rule Analytics**: Track rule usage and effectiveness
- **Dynamic Rules**: Context-aware rule application
- **Team Customization**: Team-specific rule customization
- **Integration**: Better integration with external tools

### Community Contributions

- **Rule Sharing**: Share effective rules with community
- **Best Practices**: Contribute to best practices
- **Feedback**: Provide feedback on rule effectiveness
- **Innovation**: Suggest new rule approaches

This comprehensive rule system ensures optimal development experience with Cursor IDE 1.7.33 while maintaining code quality, team collaboration, and development efficiency.
