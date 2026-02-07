/**
 * Tool definitions for MCP server
 * These tools are exposed to the AI for autonomous use
 */

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>; // or Record<string, any> if you want to allow more flexible schemas
    required?: string[];
  };
}

export const tools: ToolDefinition[] = [
  {
    name: 'get_all_items',
    description: 'Get all items (jobs and folders) from Jenkins server',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_item',
    description: 'Get details of a specific Jenkins item by its full name',
    inputSchema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          description: 'Full name of the item (e.g., "folder/job-name")',
        },
      },
      required: ['fullName'],
    },
  },
  {
    name: 'get_item_config',
    description: 'Get the XML configuration of a specific Jenkins item',
    inputSchema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          description: 'Full name of the item',
        },
      },
      required: ['fullName'],
    },
  },
  {
    name: 'query_items',
    description: 'Query Jenkins items with pattern filters',
    inputSchema: {
      type: 'object',
      properties: {
        classPattern: {
          type: 'string',
          description: 'Regex pattern to filter by item class',
        },
        fullNamePattern: {
          type: 'string',
          description: 'Regex pattern to filter by full name',
        },
        colorPattern: {
          type: 'string',
          description: 'Regex pattern to filter by build status color',
        },
      },
    },
  },
  {
    name: 'build_item',
    description: 'Trigger a build for a Jenkins item',
    inputSchema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          description: 'Full name of the item to build',
        },
        parameters: {
          type: 'object',
          description: 'Build parameters (optional)',
        },
      },
      required: ['fullName'],
    },
  },
  {
    name: 'get_all_nodes',
    description: 'Get all Jenkins nodes (agents)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_node',
    description: 'Get details of a specific Jenkins node',
    inputSchema: {
      type: 'object',
      properties: {
        nodeName: {
          type: 'string',
          description: 'Name of the node',
        },
      },
      required: ['nodeName'],
    },
  },
  {
    name: 'get_node_config',
    description: 'Get the XML configuration of a specific Jenkins node',
    inputSchema: {
      type: 'object',
      properties: {
        nodeName: {
          type: 'string',
          description: 'Name of the node',
        },
      },
      required: ['nodeName'],
    },
  },
  {
    name: 'get_all_queue_items',
    description: 'Get all items in the Jenkins build queue',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_queue_item',
    description: 'Get details of a specific queue item',
    inputSchema: {
      type: 'object',
      properties: {
        queueId: {
          type: 'number',
          description: 'ID of the queue item',
        },
      },
      required: ['queueId'],
    },
  },
  {
    name: 'cancel_queue_item',
    description: 'Cancel a specific item in the build queue',
    inputSchema: {
      type: 'object',
      properties: {
        queueId: {
          type: 'number',
          description: 'ID of the queue item to cancel',
        },
      },
      required: ['queueId'],
    },
  },
  {
    name: 'get_build',
    description: 'Get details of a specific build',
    inputSchema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          description: 'Full name of the job',
        },
        buildNumber: {
          type: 'number',
          description: 'Build number',
        },
      },
      required: ['fullName', 'buildNumber'],
    },
  },
  {
    name: 'get_build_console_output',
    description: 'Get the console output (logs) of a specific build',
    inputSchema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          description: 'Full name of the job',
        },
        buildNumber: {
          type: 'number',
          description: 'Build number',
        },
      },
      required: ['fullName', 'buildNumber'],
    },
  },
  {
    name: 'get_running_builds',
    description: 'Get all currently running builds in Jenkins',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'stop_build',
    description: 'Stop a running build',
    inputSchema: {
      type: 'object',
      properties: {
        fullName: {
          type: 'string',
          description: 'Full name of the job',
        },
        buildNumber: {
          type: 'number',
          description: 'Build number to stop',
        },
      },
      required: ['fullName', 'buildNumber'],
    },
  },
];
