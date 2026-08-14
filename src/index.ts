import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { fetchPage } from "./fetch.js";

const server = new Server(
  {
    name: "nanoparse-mcp",
    version: "1.0.2",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "nanoparse_fetch",
      description:
        "Fetch a web page and return clean, structured Markdown with metadata. " +
        "First 10 parses free per device. After that, pay $0.0175 USDC on Base via x402. " +
        "No account or API key required.",
      inputSchema: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL to fetch and convert to Markdown",
          },
          debug: {
            type: "boolean",
            description:
              "If true, include extraction diagnostics in the response (contentSelector, metadataSource, cleaning stats, timing)",
            default: false,
          },
        },
        required: ["url"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "nanoparse_fetch") {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  const args = request.params.arguments as {
    url: string;
    debug?: boolean;
  };

  if (!args.url || typeof args.url !== "string") {
    throw new Error('Missing required parameter: "url"');
  }

  try {
    const result = await fetchPage(args.url, args.debug ?? false);

    return {
      content: [
        {
          type: "text",
          text: result.markdown,
        },
      ],
      structuredContent: result,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [
        {
          type: "text",
          text: `NanoParse error: ${message}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("nanoparse-mcp server failed to start:", String(err));
  process.exit(1);
});
