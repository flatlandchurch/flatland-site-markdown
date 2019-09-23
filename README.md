# Flatland Markdown

## Front-matter API

```yaml
title: <title>
```

## Components

## Workflow

- Commit/Push changes
- CircleCI build kicks off
- Get a list of files included in the latest commit
- Run parseMarkdown against each file
- Run buildDependencyTree
- Run buildHeader against each file
- Run buildDocument against each file
- Resolve dependencies based on the dependency tree

## Dependency tree
Any document that relies on another document's content in some way is a dependency of that document. Dependencies are resolved a component level to allow the atomic data to be pulled into the tree and prevent a circular dependency loop.

### Steps
1. Use the components in a document to determine what fields are needed
2. Create a list of all fields needed in each file and pull them where necessary
3. Loop through git history

```
{
    "_lastSha1": "",
    "about.md": {
        "component_dependencies": {
            "values.md": ["title", "image"]
        }
    },
    "values.md": {
        "title": "Values",
        "image": ""
    }
}
```
