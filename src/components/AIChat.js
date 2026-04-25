// ============================================
// NEXUSMESH — Floating AI Assistant Chat Widget
// Simulates an intelligent Gemini-powered chatbot
// ============================================

const AI_RESPONSES = {
  risk: (app) => {
    const risk = app.globalRisk;
    const level = risk > 65 ? 'CRITICAL' : risk > 40 ? 'ELEVATED' : 'NOMINAL';
    return `📊 **Global Risk Assessment**\n\nCurrent global risk score is **${risk}/100** — status is **${level}**.\n\n${risk > 65 ? `🚨 Active disruption detected. GNN propagation model predicts cascade failures across ${app.activeScenario?.propagationPath?.length || 0} nodes in the next 48hrs.\n\n**Recommended actions:**\n• Activate Shadow Net ghost logistics\n• Run counterfactual engine for routing alternatives\n• Initiate SLA breach documentation` : 'All major supply corridors operating within SLA bounds. Monitoring 25 nodes across 8 regions.'}`;
  },
  shadownet: (app) => {
    return `👻 **Shadow Net Status**\n\nShadow Net is currently **${app.disruptionActive ? 'STANDING BY — ready for activation' : 'DORMANT'}**.\n\n**Available ghost resources:**\n• [GHOST] Kolkata Backhaul — 5,000 units capacity\n• [MICRO] Kanpur Dark Store — 2,000 units\n• [MICRO] Lucknow Hub — 1,500 units\n• Alt Supplier (Busan) — 8,000 units\n\n${app.disruptionActive ? '⚡ Navigate to **Shadow Net** tab to activate emergency routing.' : 'Activate via the Shadow Net panel when a disruption is detected.'}`;
  },
  scenario: (app) => {
    if (!app.activeScenario) {
      return `🎲 **No Active Simulation**\n\nNo disruption simulation is currently running. Click **⚡ SIMULATE DISRUPTION** in the header to trigger a real-time news-based scenario.\n\nAvailable scenario types:\n• Regulatory (border blockades)\n• Natural disasters\n• Labor strikes\n• Cyber attacks\n• Geopolitical sanctions`;
    }
    const s = app.activeScenario;
    return `🚨 **Active Scenario: ${s.headline}**\n\n**Type:** ${s.type.toUpperCase()}\n**Region:** ${s.region}\n**Revenue at Risk:** $${(s.revenueAtRisk / 1e6).toFixed(1)}M\n**Est. Impact:** ${s.estimatedImpactHrs}hrs\n\n**Propagation Path:**\n${s.propagationPath.join(' → ')}\n\n**AI Recommendation:** ${s.alternativeNodes.length > 0 ? `Reroute via ${s.alternativeNodes[0]} to minimize impact.` : 'No alternatives available — escalate to human review.'}`;
  },
  sla: () => `✨ **SLA Actuation Engine**\n\nGemini SLA is ready to generate autonomous legal and logistics documentation.\n\n**Available actions:**\n• Generate Force Majeure notices\n• Draft carrier penalty waivers\n• Produce rerouting authorization letters\n• Create vendor substitution agreements\n\nNavigate to the **Gemini SLA** tab to initiate document generation.`,
  help: () => `🤖 **NexusMesh AI Assistant**\n\nI can help you with:\n\n• **risk** — Current global risk assessment\n• **shadownet** — Shadow Net status & resources\n• **scenario** — Active disruption scenario details\n• **sla** — SLA document generation\n• **map** — Geographic supply chain visualization\n• **telemetry** — Worker behavioral signals\n\nJust type any of these keywords or ask a question!`,
  map: () => `🗺️ **Geographic Map View**\n\nThe interactive supply chain map is embedded on the Dashboard and in the Network Graph view.\n\n**Map features:**\n• Real-time node status with pulsing indicators\n• Animated disruption propagation routes\n• Click any node for detailed stats\n• Disruption origins shown in red\n• Affected nodes shown in amber`,
  telemetry: (app) => `📡 **Dark Matter Telemetry**\n\n**Dhaka Warehouse (Edge TPU Node)**\n• Scan Hesitation: ${app.disruptionActive ? '1,088 ms 🚨' : '324 ms ✅'}\n• Re-scan Rate: ${app.disruptionActive ? '11.4% 🚨' : '2.1% ✅'}\n• Worker Fatigue: ${app.disruptionActive ? '87/100 ⚠️' : '34/100 ✅'}\n\nBehavioral biometric signals are captured via wrist-worn IoT sensors and processed by on-site Edge TPUs in real-time.`,
};

function getAIResponse(input, app) {
  const q = input.toLowerCase();
  if (q.includes('risk') || q.includes('score')) return AI_RESPONSES.risk(app);
  if (q.includes('shadow') || q.includes('ghost')) return AI_RESPONSES.shadownet(app);
  if (q.includes('scenario') || q.includes('disrupt') || q.includes('simulation')) return AI_RESPONSES.scenario(app);
  if (q.includes('sla') || q.includes('document') || q.includes('legal')) return AI_RESPONSES.sla();
  if (q.includes('map') || q.includes('geo') || q.includes('location')) return AI_RESPONSES.map();
  if (q.includes('telemetry') || q.includes('worker') || q.includes('biometric')) return AI_RESPONSES.telemetry(app);
  if (q.includes('help') || q.includes('what') || q.includes('how')) return AI_RESPONSES.help();
  return `🤖 I understand you're asking about **"${input}"**.\n\nI'm NexusMesh AI — I specialize in supply chain intelligence. Try asking me about:\n• **risk** scores\n• **shadownet** resources\n• current **scenario**\n• **telemetry** signals\n\nType **help** for a full list of commands.`;
}

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/•/g, '&bull;');
}

export function initAIChat(app) {
  // Create widget HTML
  const widget = document.createElement('div');
  widget.id = 'ai-chat-widget';
  widget.innerHTML = `
    <button id="ai-chat-toggle" title="Open AI Assistant">
      <span id="ai-chat-icon">🤖</span>
      <span id="ai-chat-badge" style="display:none">1</span>
    </button>
    <div id="ai-chat-panel" class="ai-panel-hidden">
      <div id="ai-chat-header">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,rgba(0,240,255,0.2),rgba(139,92,246,0.2));border:1px solid rgba(0,240,255,0.3);display:flex;align-items:center;justify-content:center;font-size:16px">🤖</div>
          <div>
            <div style="font-weight:700;font-size:13px;color:#e8eaed">NexusMesh AI</div>
            <div style="font-size:10px;color:#00e676;display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:6px;height:6px;background:#00e676;border-radius:50%"></span>Online</div>
          </div>
        </div>
        <button id="ai-chat-close">✕</button>
      </div>
      <div id="ai-chat-messages">
        <div class="ai-msg ai-msg-bot">
          <div class="ai-msg-content">👋 <strong>Welcome to NexusMesh AI</strong><br><br>I'm your intelligent supply chain assistant. I can help you analyze risks, monitor disruptions, and navigate Shadow Net resources.<br><br>Type <strong>help</strong> to see what I can do!</div>
        </div>
      </div>
      <div id="ai-chat-suggestions">
        <button class="ai-suggest" data-q="risk">📊 Risk Score</button>
        <button class="ai-suggest" data-q="scenario">🚨 Active Scenario</button>
        <button class="ai-suggest" data-q="shadownet">👻 Shadow Net</button>
      </div>
      <div id="ai-chat-input-row">
        <input id="ai-chat-input" type="text" placeholder="Ask NexusMesh AI anything..." autocomplete="off" />
        <button id="ai-chat-send">➤</button>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    #ai-chat-widget {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 8000;
    }
    #ai-chat-toggle {
      width: 52px; height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(139,92,246,0.2));
      border: 1px solid rgba(0,240,255,0.4);
      color: white;
      font-size: 22px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,240,255,0.25);
      transition: all 0.2s;
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    #ai-chat-toggle:hover { transform: scale(1.1); box-shadow: 0 4px 30px rgba(0,240,255,0.45); }
    #ai-chat-badge {
      position: absolute; top: -4px; right: -4px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #ff1744; color: white;
      font-size: 9px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    #ai-chat-panel {
      position: absolute;
      bottom: 64px; right: 0;
      width: 360px;
      background: rgba(10, 14, 26, 0.97);
      border: 1px solid rgba(0,240,255,0.2);
      border-radius: 18px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 30px rgba(0,240,255,0.08);
      backdrop-filter: blur(30px);
      overflow: hidden;
      display: flex; flex-direction: column;
      max-height: 520px;
      transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
      transform-origin: bottom right;
    }
    .ai-panel-hidden { opacity: 0; transform: scale(0.8); pointer-events: none; }
    .ai-panel-visible { opacity: 1; transform: scale(1); pointer-events: all; }
    #ai-chat-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      background: rgba(15,20,33,0.8);
    }
    #ai-chat-close {
      width: 28px; height: 28px; border-radius: 50%;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      color: #9aa0a6; cursor: pointer; font-size: 12px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    #ai-chat-close:hover { background: rgba(255,23,68,0.1); border-color: rgba(255,23,68,0.3); color: #ff1744; }
    #ai-chat-messages {
      flex: 1; overflow-y: auto;
      padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .ai-msg { display: flex; flex-direction: column; }
    .ai-msg-bot .ai-msg-content {
      background: rgba(0,240,255,0.06);
      border: 1px solid rgba(0,240,255,0.1);
      border-radius: 14px 14px 14px 4px;
      padding: 12px 14px;
      font-size: 12.5px; line-height: 1.6;
      color: #e8eaed;
      max-width: 90%;
    }
    .ai-msg-user .ai-msg-content {
      background: rgba(139,92,246,0.15);
      border: 1px solid rgba(139,92,246,0.25);
      border-radius: 14px 14px 4px 14px;
      padding: 10px 14px;
      font-size: 12.5px;
      color: #e8eaed;
      align-self: flex-end;
    }
    .ai-msg-user { align-items: flex-end; }
    .ai-typing .ai-msg-content {
      display: flex; gap: 4px; align-items: center; padding: 14px 16px;
    }
    .ai-typing-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(0,240,255,0.5);
      animation: ai-typing-bounce 1.2s ease-in-out infinite;
    }
    .ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes ai-typing-bounce {
      0%,80%,100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
    #ai-chat-suggestions {
      padding: 8px 16px;
      display: flex; gap: 6px; flex-wrap: wrap;
      border-top: 1px solid rgba(255,255,255,0.04);
    }
    .ai-suggest {
      background: rgba(0,240,255,0.06);
      border: 1px solid rgba(0,240,255,0.15);
      color: rgba(0,240,255,0.8);
      border-radius: 20px;
      padding: 4px 10px;
      font-size: 10.5px; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
      font-family: 'Inter', sans-serif;
    }
    .ai-suggest:hover { background: rgba(0,240,255,0.12); border-color: rgba(0,240,255,0.4); }
    #ai-chat-input-row {
      display: flex; gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.05);
      background: rgba(10,14,26,0.6);
    }
    #ai-chat-input {
      flex: 1; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 8px 12px;
      color: #e8eaed; font-size: 13px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.2s;
    }
    #ai-chat-input:focus { border-color: rgba(0,240,255,0.3); }
    #ai-chat-input::placeholder { color: #5f6368; }
    #ai-chat-send {
      width: 36px; height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(0,240,255,0.2), rgba(139,92,246,0.2));
      border: 1px solid rgba(0,240,255,0.3);
      color: #00f0ff; cursor: pointer;
      font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    #ai-chat-send:hover { background: linear-gradient(135deg, rgba(0,240,255,0.3), rgba(139,92,246,0.3)); transform: scale(1.05); }
    #ai-chat-messages::-webkit-scrollbar { width: 4px; }
    #ai-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #ai-chat-messages::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); border-radius: 2px; }
  `;
  document.head.appendChild(style);

  // Bind events
  const panel = document.getElementById('ai-chat-panel');
  const toggle = document.getElementById('ai-chat-toggle');
  const closeBtn = document.getElementById('ai-chat-close');
  const input = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');
  const messagesEl = document.getElementById('ai-chat-messages');
  const badge = document.getElementById('ai-chat-badge');

  let isOpen = false;

  toggle.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.className = isOpen ? 'ai-panel-visible' : 'ai-panel-hidden';
    badge.style.display = 'none';
  });
  closeBtn.addEventListener('click', () => {
    isOpen = false;
    panel.className = 'ai-panel-hidden';
  });

  document.querySelectorAll('.ai-suggest').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });

  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (text) { sendMessage(text); input.value = ''; }
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = input.value.trim();
      if (text) { sendMessage(text); input.value = ''; }
    }
  });

  function addMessage(content, isUser) {
    const div = document.createElement('div');
    div.className = `ai-msg ${isUser ? 'ai-msg-user' : 'ai-msg-bot'}`;
    div.innerHTML = `<div class="ai-msg-content">${isUser ? content : renderMarkdown(content)}</div>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'ai-msg ai-msg-bot ai-typing';
    div.id = 'ai-typing-indicator';
    div.innerHTML = `<div class="ai-msg-content"><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div><div class="ai-typing-dot"></div></div>`;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    document.getElementById('ai-typing-indicator')?.remove();
  }

  function sendMessage(text) {
    addMessage(text, true);
    showTyping();
    setTimeout(() => {
      hideTyping();
      const response = getAIResponse(text, app);
      addMessage(response, false);
    }, 800 + Math.random() * 600);
  }

  // Show badge when disruption happens
  window._aiChatNotify = () => {
    if (!isOpen) { badge.style.display = 'flex'; badge.textContent = '!'; }
    addMessage('🚨 **Alert Triggered!** A new disruption scenario is now active. Type **scenario** to get details or **risk** to see the updated global risk score.', false);
  };
}
