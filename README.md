# Unity Package Version Update
Workflow template

```
name: Unity Package Semantic Versioning Auto Update

on: 
    push:
      branches:
        - 'upm'

jobs:
  update-version:
    name: 'Increment version number on upm'
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          ref: ${{ github.ref }}
      - name: Find Package Version
        id: upm-semver-update
        uses: TB-Terence/upm-semver-update@upm
        with:
          package-json-path: './package.json'
          assembly-info-path: './Runtime/AssemblyInfo.cs'
      - name: Commit New Version 
        if: ${{ steps.upm-semver-update.outputs.require-update }}
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Update package version to ${{ steps.upm-semver-update.outputs.new-version }} via automated action"
          commit_options: '--no-verify --signoff'
          branch: upm
```