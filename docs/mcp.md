# MCP server

The MCP server lets a coding agent search the icon set and fetch an icon in the form your project needs, without leaving the editor.

## Setup

The server speaks MCP over stdio. In any client that takes a JSON server list:

```json
{
  "mcpServers": {
    "magic-glyphs": { "command": "npx", "args": ["-y", "magic-glyphs-mcp"] }
  }
}
```

With Claude Code:

```bash
claude mcp add magic-glyphs -- npx -y magic-glyphs-mcp
```

The server lives in its own small package, `magic-glyphs-mcp`, so that installing the icons does not pull in the MCP libraries. It uses the same licence login as the command line tool.

## Tools

| Tool | What it does |
|---|---|
| `search_icons` | Keyword search. Arguments: `query`, optional `category`, `limit`. |
| `list_categories` | Categories with counts. |
| `get_icon` | One icon as `html`, `react`, `vue`, `svg`, `lottie` or `json`. Arguments: `name`, optional `format`, `style`, `color`, `secondary`, `size`. Returns a suggested file name and the content. |
| `usage_guide` | Install and usage steps for one platform. |

All four are read-only: the server never writes files. The agent decides where to put what it receives.

## Example requests

- "Add an animated trash icon to the delete button." The agent calls `search_icons("trash delete")`, then `get_icon("trash", format: "react")`.
- "Export the arrow icons as Lottie for the iOS app." The agent uses `usage_guide("ios")` and the CLI.

## Errors

Unknown names return suggestions ("Did you mean: ..."), unknown categories return the valid list, and unsupported combinations (for example Lottie in the glass style) say why.

## Your own icons

Set `MAGIC_GLYPHS_CUSTOM` to a folder of icon data exported from the icon maker, and the assistant can search and insert those too:

```json
{ "mcpServers": { "magic-glyphs": { "command": "npx", "args": ["-y", "magic-glyphs-mcp"], "env": { "MAGIC_GLYPHS_CUSTOM": "/path/to/my-icons" } } } }
```
