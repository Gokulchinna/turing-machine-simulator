// StateDiagramView.js - Renders an animated SVG graph of the Turing Machine states

export class StateDiagramView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.svgNS = "http://www.w3.org/2000/svg";
    this.nodesMap = new Map();
    this.edgesMap = new Map(); // key: "state,symbol" => edge SVG group

    // For tracking the timeout of flashing edges
    this.flashTimeouts = new Map();

    // Zoom/Pan state
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
  }

  render(machine) {
    if (!this.container) return;
    this.container.innerHTML = "";
    this.nodesMap.clear();
    this.edgesMap.clear();

    // Reset Zoom/Pan
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;

    if (!machine || machine.states.length === 0) return;

    // Scale canvas and circle radius with the number of states
    const numNodes = machine.states.length;
    const width  = numNodes <= 3 ? 500 : Math.max(500, numNodes * 110);
    const height = numNodes <= 3 ? 400 : Math.max(400, numNodes * 90);

    // Create SVG root
    this.svg = document.createElementNS(this.svgNS, "svg");
    this.svg.setAttribute("class", "state-diagram-svg");
    this.svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    // Define markers for arrowheads
    const defs = document.createElementNS(this.svgNS, "defs");

    // Normal arrow
    const marker = document.createElementNS(this.svgNS, "marker");
    marker.setAttribute("id", "arrow");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "6");
    marker.setAttribute("markerHeight", "6");
    marker.setAttribute("orient", "auto-start-reverse");
    const path = document.createElementNS(this.svgNS, "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.setAttribute("fill", "var(--text-muted)");
    marker.appendChild(path);

    // Active/Flashing arrow
    const markerActive = document.createElementNS(this.svgNS, "marker");
    markerActive.setAttribute("id", "arrow-active");
    markerActive.setAttribute("viewBox", "0 0 10 10");
    markerActive.setAttribute("refX", "9");
    markerActive.setAttribute("refY", "5");
    markerActive.setAttribute("markerWidth", "6");
    markerActive.setAttribute("markerHeight", "6");
    markerActive.setAttribute("orient", "auto-start-reverse");
    const pathActive = document.createElementNS(this.svgNS, "path");
    pathActive.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    pathActive.setAttribute("fill", "var(--accent-cyan)");
    markerActive.appendChild(pathActive);

    defs.appendChild(marker);
    defs.appendChild(markerActive);
    this.svg.appendChild(defs);

    // Group elements
    this.zoomGroup = document.createElementNS(this.svgNS, "g");
    this.updateTransform();

    this.edgesGroup = document.createElementNS(this.svgNS, "g");
    this.nodesGroup = document.createElementNS(this.svgNS, "g");

    this.zoomGroup.appendChild(this.edgesGroup);
    this.zoomGroup.appendChild(this.nodesGroup);
    this.svg.appendChild(this.zoomGroup);
    this.container.appendChild(this.svg);

    this.setupInteraction();

    // Layout Nodes (Circular layout)
    const cx = width / 2;
    const cy = height / 2;
    // Give each state at least 95px of arc-space so labels don't overlap
    const minRadiusBySpacing = (numNodes * 95) / (2 * Math.PI);
    const layoutRadius = Math.max(numNodes <= 3 ? 100 : 150, minRadiusBySpacing);
    const nodeRadius = 24;

    machine.states.forEach((state, index) => {
      // Rotate starting from left, distribute evenly
      const angle = (index / numNodes) * 2 * Math.PI + Math.PI;

      const x = cx + layoutRadius * Math.cos(angle);
      const y = cy + layoutRadius * Math.sin(angle);

      this.nodesMap.set(state, { x, y, radius: nodeRadius, data: state });
    });

    // Group transitions by source->target
    const edgeData = new Map();

    for (const [key, val] of machine.transitions) {
      const [source, symbol] = key.split(",");
      const target = val.nextState;
      const tKey = `${source}->${target}`;

      if (!edgeData.has(tKey)) edgeData.set(tKey, []);
      // Map display label format: "a→X, R"
      edgeData.get(tKey).push(`${symbol}→${val.writeSymbol}, ${val.direction}`);
    }

    // Draw Edges
    for (const [tKey, labels] of edgeData) {
      const [source, target] = tKey.split("->");
      const n1 = this.nodesMap.get(source);
      const n2 = this.nodesMap.get(target);
      if (!n1 || !n2) continue;

      const reverseKey = `${target}->${source}`;
      // Needs curve if bidirectional to prevent line overlap
      const bidirectional = source !== target && edgeData.has(reverseKey);

      const edgeGroup = this.drawEdge(n1, n2, labels.join(", "), bidirectional);
      this.edgesGroup.appendChild(edgeGroup);

      // Store all specific symbol transitions to this visual edge group
      // so we can flash it on step()
      labels.forEach(l => {
        const originalSymbol = l.split("→")[0];
        this.edgesMap.set(`${source},${originalSymbol}`, edgeGroup);
      });
    }

    // Draw Nodes
    machine.states.forEach(state => {
      const node = this.nodesMap.get(state);
      // Determine machine status logic
      const isStart = (state === machine.startState);
      const isAccept = (state === machine.acceptState);
      const isReject = (state === 'reject' || state === 'q_reject' || state === 'q_err'); // heuristics or strict matches

      this.drawNode(node, isStart, isAccept, isReject);
    });

    // Initial highlight
    this.highlight({ currentState: machine.currentState });
  }

  drawNode(n, isStart, isAccept, isReject) {
    const group = document.createElementNS(this.svgNS, "g");
    group.setAttribute("transform", `translate(${n.x}, ${n.y})`);

    // Start arrow indicating entry point
    if (isStart) {
      const startLine = document.createElementNS(this.svgNS, "path");
      startLine.setAttribute("d", `M -50 0 L -${n.radius + 3} 0`);
      startLine.setAttribute("stroke", "var(--text-muted)");
      startLine.setAttribute("stroke-width", "2");
      startLine.setAttribute("marker-end", "url(#arrow)");
      group.appendChild(startLine);
    }

    const circle = document.createElementNS(this.svgNS, "circle");
    circle.setAttribute("r", n.radius);
    circle.setAttribute("class", "diagram-node");

    // Store reference for dynamic class toggling
    n.svgElement = circle;
    group.appendChild(circle);

    // Accept states have double rings
    if (isAccept) {
      const inner = document.createElementNS(this.svgNS, "circle");
      inner.setAttribute("r", n.radius - 4);
      inner.setAttribute("class", "diagram-node-accept-inner");
      group.appendChild(inner);
    }

    const text = document.createElementNS(this.svgNS, "text");
    text.setAttribute("class", "diagram-node-text");
    text.textContent = n.data;
    text.setAttribute("y", "2"); // minor vertical optical centering
    if (isReject) text.setAttribute("fill", "var(--accent-red)");
    group.appendChild(text);

    this.nodesGroup.appendChild(group);
  }

  drawEdge(n1, n2, labelText, bidirectional) {
    const group = document.createElementNS(this.svgNS, "g");

    const path = document.createElementNS(this.svgNS, "path");
    path.setAttribute("class", "diagram-edge");
    path.setAttribute("marker-end", "url(#arrow)");

    let tx = 0, ty = 0;

    if (n1 === n2) {
      // Self loop
      const r = n1.radius;
      const startX = n1.x - 10;
      const startY = n1.y - r + 3;
      const endX = n1.x + 10;
      const endY = n1.y - r + 3;
      path.setAttribute("d", `M ${startX} ${startY} C ${n1.x - 45} ${n1.y - 85}, ${n1.x + 45} ${n1.y - 85}, ${endX} ${endY}`);
      tx = n1.x;
      ty = n1.y - 68;
    } else {
      const dx = n2.x - n1.x;
      const dy = n2.y - n1.y;
      const dist = Math.hypot(dx, dy);

      const dirX = dx / dist;
      const dirY = dy / dist;

      const endX = n2.x - dirX * (n2.radius + 3);
      const endY = n2.y - dirY * (n2.radius + 3);
      const startX = n1.x + dirX * (n1.radius + 3);
      const startY = n1.y + dirY * (n1.radius + 3);

      if (bidirectional) {
        // Curve the path slightly
        const cx = (startX + endX) / 2;
        const cy = (startY + endY) / 2;

        // Perpendicular offset normal vector
        const nx = -dirY;
        const ny = dirX;

        const bend = 30; // Control curve depth
        const ctrlX = cx + nx * bend;
        const ctrlY = cy + ny * bend;

        path.setAttribute("d", `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`);
        tx = ctrlX;
        ty = ctrlY;
      } else {
        // Straight line
        path.setAttribute("d", `M ${startX} ${startY} L ${endX} ${endY}`);
        tx = (startX + endX) / 2;
        ty = (startY + endY) / 2;
      }
    }

    group.appendChild(path);

    // Thick stroke text clone acts as a hacky label background in SVG
    const textBg = document.createElementNS(this.svgNS, "text");
    textBg.setAttribute("class", "diagram-edge-label");
    textBg.setAttribute("x", tx);
    textBg.setAttribute("y", ty - 6);
    textBg.textContent = labelText;
    textBg.setAttribute("stroke", "var(--bg-surface)");
    textBg.setAttribute("stroke-width", "5");
    textBg.setAttribute("stroke-linejoin", "round");

    const txt = document.createElementNS(this.svgNS, "text");
    txt.setAttribute("class", "diagram-edge-label");
    txt.setAttribute("x", tx);
    txt.setAttribute("y", ty - 6);
    txt.textContent = labelText;

    group.appendChild(textBg);
    group.appendChild(txt);

    group.originalPath = path;

    return group;
  }

  highlight(snapshot) {
    if (!snapshot) return;

    // Reset all nodes
    this.nodesMap.forEach(n => {
      if (n.svgElement) n.svgElement.classList.remove('active');
    });

    // Activate current node
    if (snapshot.currentState) {
      const node = this.nodesMap.get(snapshot.currentState);
      if (node && node.svgElement) {
        node.svgElement.classList.add('active');
      }
    }

    // Flash transition arrow
    if (snapshot.lastTransition) {
      const lKey = `${snapshot.lastTransition.state},${snapshot.lastTransition.symbol}`;
      const edgeGroup = this.edgesMap.get(lKey);

      if (edgeGroup && edgeGroup.originalPath) {
        const path = edgeGroup.originalPath;

        if (this.flashTimeouts.has(path)) {
          clearTimeout(this.flashTimeouts.get(path));
        }

        path.classList.add('flash');
        path.setAttribute("marker-end", "url(#arrow-active)");

        const timeout = setTimeout(() => {
          path.classList.remove('flash');
          path.setAttribute("marker-end", "url(#arrow)");
          this.flashTimeouts.delete(path);
        }, 400); // 400ms flash duration mapping to most auto-solve intervals

        this.flashTimeouts.set(path, timeout);
      }
    }
  }

  setupInteraction() {
    this.svg.style.cursor = "grab";

    this.svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      if (e.deltaY < 0) {
        this.scale *= zoomFactor;
      } else {
        this.scale /= zoomFactor;
      }
      this.scale = Math.max(0.2, Math.min(this.scale, 5));
      this.updateTransform();
    });

    this.svg.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.dragStartX = e.clientX - this.translateX;
      this.dragStartY = e.clientY - this.translateY;
      this.svg.style.cursor = "grabbing";
    });

    this.svg.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.translateX = e.clientX - this.dragStartX;
      this.translateY = e.clientY - this.dragStartY;
      this.updateTransform();
    });

    this.svg.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.svg.style.cursor = "grab";
    });

    this.svg.addEventListener("mouseleave", () => {
      this.isDragging = false;
      this.svg.style.cursor = "grab";
    });
  }

  updateTransform() {
    if (this.zoomGroup) {
      this.zoomGroup.style.transformOrigin = "center center";
      this.zoomGroup.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    }
  }
}
