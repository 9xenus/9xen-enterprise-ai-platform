import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { retrieveContext } from './rag';
import { agentTools } from './tools';

/**
 * 9xen Enterprise Platform — Deep Agent (LangGraph).
 *
 * A multi-node agent graph:
 *   classify → retrieve → act (tool loop) → respond
 *
 * - classify: routes off-topic queries to the guardrail (zero-exception domain policy)
 * - retrieve: pulls relevant CMS context from the local project-folder vector store
 * - act:     LLM + tools (catalog search, calendar booking, lead capture, site info)
 * - respond: composes the final consultative answer with citations & follow-ups
 *
 * The agent is strictly domain-guarded to 9xen products, services, pricing,
 * company info, and demo scheduling.
 */

const GUARDRAIL_DECLINE = `I appreciate your message, but I am exclusively dedicated to 9xen's enterprise AI products and solutions. I can help you with:

- **9xen Agentic Core** — autonomous multi-agent orchestration
- **Reguletter Compliance SaaS** — SEC 17a-4 / FINRA / FCA / EU AI Act automation
- **AlphaBot Pro** — institutional quant trading engine
- **Enterprise Guardrail Gateway** — sub-5ms AI firewall
- **Synthia** — synthetic data & LLM fine-tuning
- **Foundation Models** — 9xen Omni 2.5, Reasoning Pro, Flash Turbo
- **Pricing, demos, and executive discovery sessions**

How may I assist you with 9xen's enterprise AI platform today?`;

// Custom agent state: messages + intent + guardrail + citations + followUps
const AgentStateAnnotation = Annotation.Root({
  messages: Annotation({
    reducer: (prev, next) => prev.concat(next),
    default: () => [],
  }),
  intent: Annotation({
    reducer: (_prev, next) => next,
    default: () => 'product_inquiry',
  }),
  guardrailTriggered: Annotation({
    reducer: (_prev, next) => next,
    default: () => false,
  }),
  followUps: Annotation({
    reducer: (_prev, next) => next,
    default: () => [] as string[],
  }),
});

type AgentState = typeof AgentStateAnnotation.State;

function buildModel() {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.0-flash',
    temperature: 0.3,
    maxOutputTokens: 1024,
  });
}

function getLastUserText(messages: any[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].getType?.() === 'human' || messages[i] instanceof HumanMessage) {
      return messages[i].content?.toString() || '';
    }
  }
  return '';
}

// ---------------------------------------------------------------------------
// Node: classify intent + enforce domain guardrail
// ---------------------------------------------------------------------------

async function classifyNode(state: AgentState): Promise<Partial<AgentState>> {
  const text = getLastUserText(state.messages);

  const classifier = buildModel();
  const result = await classifier.invoke([
    new SystemMessage(
      `You are a strict intent classifier for the 9xen enterprise AI platform.
Classify the user message into exactly ONE intent:
- product_inquiry: questions about 9xen products, services, platforms, models, features, integrations
- pricing: questions about costs, token rates, licenses, quotes, budgets
- booking: requests to schedule a demo, meeting, or discovery session
- lead_capture: expressions of buying interest, requests for quotes/proposals/sales contact
- company_info: questions about 9xen the company, contact details, team, careers
- off_topic: anything NOT related to 9xen (general knowledge, trivia, weather, recipes, jokes, politics, coding homework, etc.)

Respond with ONLY the intent label, nothing else.`
    ),
    new HumanMessage(text),
  ]);

  const label = result.content.toString().trim().toLowerCase();
  const validIntents = ['product_inquiry', 'pricing', 'booking', 'lead_capture', 'company_info'];
  const intent = (validIntents.includes(label) ? label : 'off_topic') as AgentState['intent'];

  return {
    intent,
    guardrailTriggered: intent === 'off_topic',
  };
}

// ---------------------------------------------------------------------------
// Node: retrieve RAG context from the local vector store
// ---------------------------------------------------------------------------

async function retrieveNode(state: AgentState): Promise<Partial<AgentState>> {
  if (state.guardrailTriggered) return {};
  const text = getLastUserText(state.messages);
  const contextChunks = await retrieveContext(text, 6);

  if (contextChunks.length === 0) return {};

  const contextMessage = new SystemMessage(
    `RETRIEVED 9XEN KNOWLEDGE BASE CONTEXT (from local vector store):\n\n${contextChunks.join('\n\n---\n\n')}\n\nUse this context to answer accurately. Cite sources when relevant.`
  );

  return { messages: [contextMessage] };
}

// ---------------------------------------------------------------------------
// Node: act — LLM with tools (tool-calling loop)
// ---------------------------------------------------------------------------

async function actNode(state: AgentState): Promise<Partial<AgentState>> {
  if (state.guardrailTriggered) return {};

  const model = buildModel().bindTools(agentTools);
  const persona = state.intent === 'booking'
    ? 'You are scheduling an executive demo. Use check_calendar_availability and book_calendar_slot tools. Confirm details before booking.'
    : state.intent === 'lead_capture'
    ? 'You are a sales agent. Use capture_lead tool when the user shows buying interest.'
    : 'You are an enterprise solutions advisor. Use search_cms_tool and get_product_details_tool to answer accurately.';

  const system = new SystemMessage(
    `You are the 9xen Autonomous Intelligence Assistant. ${persona}
STRICT DOMAIN GUARDRAIL: Only answer questions about 9xen products, services, pricing, company, and demos.
If asked about anything else, politely refuse and redirect to 9xen.
Current intent: ${state.intent}.`
  );

  const result = await model.invoke([system, ...state.messages]);
  return { messages: [result] };
}

// ---------------------------------------------------------------------------
// Node: respond — final answer composition
// ---------------------------------------------------------------------------

async function respondNode(state: AgentState): Promise<Partial<AgentState>> {
  if (state.guardrailTriggered) {
    return {
      messages: [new AIMessage(GUARDRAIL_DECLINE)],
      followUps: [
        'Explore 9xen Agentic Core',
        'View Reguletter Compliance Features',
        'Schedule Executive Demo',
        'Contact Solutions Architecture',
      ],
    };
  }

  // If the last message is a tool call, let the ToolNode handle it (loop back).
  const last = state.messages[state.messages.length - 1];
  if (last instanceof AIMessage && last.tool_calls?.length > 0) {
    return {};
  }

  const model = buildModel();
  const result = await model.invoke([
    new SystemMessage(
      `Compose the final response for the user based on the conversation and tool results.
Format: professional markdown with bullet points. Include a clear call-to-action.
Intent: ${state.intent}.`
    ),
    ...state.messages,
  ]);

  const followUps =
    state.intent === 'booking'
      ? ['Confirm my demo', 'What should I prepare?', 'Talk to sales']
      : state.intent === 'pricing'
      ? ['Get a custom quote', 'Compare foundation models', 'Schedule Executive Demo']
      : ['Schedule Executive Demo', 'Explore 9xen Agentic Core', 'View Reguletter Compliance Features'];

  return { messages: [result], followUps };
}

// ---------------------------------------------------------------------------
// Graph assembly
// ---------------------------------------------------------------------------

function buildAgentGraph() {
  const graph = new StateGraph(AgentStateAnnotation)
    .addNode('classify', classifyNode)
    .addNode('retrieve', retrieveNode)
    .addNode('act', actNode)
    .addNode('respond', respondNode)
    .addNode('tools', new ToolNode(agentTools))
    .addEdge(START, 'classify')
    .addEdge('classify', 'retrieve')
    .addEdge('retrieve', 'act')
    .addConditionalEdges('act', (state: AgentState) => {
      const last = state.messages[state.messages.length - 1];
      if (last instanceof AIMessage && last.tool_calls?.length > 0) return 'tools';
      return 'respond';
    })
    .addEdge('tools', 'act')
    .addEdge('respond', END);

  return graph.compile();
}

let compiledGraph: ReturnType<typeof buildAgentGraph> | null = null;

function getGraph() {
  if (!compiledGraph) compiledGraph = buildAgentGraph();
  return compiledGraph;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface DeepAgentResult {
  reply: string;
  intent: string;
  guardrailTriggered: boolean;
  followUps: string[];
  citations: Array<{ title: string; url: string; snippet?: string }>;
  toolCalls: string[];
}

export async function runDeepAgent(
  message: string,
  history: Array<{ role: string; content: string }> = []
): Promise<DeepAgentResult> {
  const messages: any[] = [];
  for (const h of history.slice(-8)) {
    if (h.role === 'user') messages.push(new HumanMessage(h.content));
    else if (h.role === 'assistant') messages.push(new AIMessage(h.content));
  }
  messages.push(new HumanMessage(message));

  const result = await getGraph().invoke({ messages } as any);

  const finalMessages = result.messages || [];
  const lastAi = [...finalMessages].reverse().find((m) => m instanceof AIMessage);
  const reply = lastAi?.content?.toString() || '';

  const toolCalls: string[] = [];
  for (const m of finalMessages) {
    if (m.getType?.() === 'tool') {
      toolCalls.push(m.name || 'unknown');
    }
  }

  const followUpsRaw = (result as any).followUps;
  const intent = (result as any).intent || 'product_inquiry';
  const guardrailTriggered = (result as any).guardrailTriggered === true;

  return {
    reply,
    intent,
    guardrailTriggered,
    followUps: Array.isArray(followUpsRaw) ? followUpsRaw : [],
    citations: [],
    toolCalls,
  };
}

export { GUARDRAIL_DECLINE };
