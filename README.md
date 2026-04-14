<div align="center">
  <h1>🖥️ Turing Machine Simulator & Computation Debugger</h1>
  <p>
    An interactive web-based simulator for <b>Single-Tape Turing Machines</b> with advanced debugging tools.
    Visualize step-by-step computation, build custom machines, and analyze execution behavior in a clear and intuitive way.
  </p>
</div>

---

## 🧠 What This Project Does

This project simulates a **Single-Tape Turing Machine** and transforms an abstract theoretical concept into an **interactive visual system**.

You can:

* Run predefined machines (e.g., aⁿbⁿ, palindrome)
* Build your own machines using transition rules
* Observe step-by-step execution on the tape
* Debug computations using replay, breakpoints, and trace logs
* Analyze performance using execution metrics and stress testing

---

## ✨ Key Features

### 🔬 Simulation & Debugging

* **Step-by-Step Execution** — Observe how the machine processes input one step at a time
* **Replay Timeline Slider** — Move forward/backward through computation history like a video
* **Breakpoint System** — Pause execution when a specific state or symbol is reached
* **Step-Back Control** — Rewind execution to previous configurations

---

### 🧾 Computation Insight

* **Smart ID Trace** — Formal computation trace (e.g., `⊢ Xa[a]bbb (q1)`)
* **Transition Impact View** — See exact changes in tape (Before → After)
* **Execution Summary** — Final result with:

  * Total steps
  * Tape cells used
  * Final state
* **Advanced Metrics**:

  * Unique states visited
  * Left/Right moves
  * Total writes performed

---

### 🎨 Visualization

* **Dynamic Tape Display** — Real-time tape updates with head highlighting
* **Active Zone Highlight** — Focus area around current head position
* **Status Indicators**:

  * 🟢 ACCEPTED
  * 🔴 REJECTED
  * 🟡 RUNNING

---

### 🏗️ Custom Machine Builder

* Create your own Turing Machine by defining:

  * States
  * Input & tape symbols
  * Transition rules
* **Live Validation**:

  * Detect missing transitions
  * Highlight invalid inputs directly in UI

---

### 🧪 Stress Testing

* Run multiple inputs automatically
* Compare results across different strings

Example:

| Input  | Result | Steps |
| ------ | ------ | ----- |
| aabb   | ACCEPT | 20    |
| aaabbb | ACCEPT | 32    |
| ab     | REJECT | 5     |

---

## ▶️ How to Use

1. Select a predefined machine
2. Enter an input string
3. Click **Run** or **Step**
4. Observe:

   * Tape changes
   * State transitions
   * ID trace log
5. Use advanced tools:

   * Replay slider to navigate steps
   * Breakpoints to control execution
   * Stress test for multiple inputs

---

## 🧪 Example

**Input:** `aaabbb`

**Execution:**

```
(q0, aaabbb)
→ (q1, Xaabbb)
→ (q2, XaaYbb)
→ ...
→ ACCEPTED
```

This shows how the machine processes the string step-by-step.

---

## 📁 Project Structure

```
turing-machine-simulator/
├── index.html              # Main UI
├── styles.css              # Styling
├── app.js                  # Main controller
│
├── engine/
│   ├── TuringMachine.js    # Core logic and execution
│   ├── Tape.js             # Tape and head operations
│   └── TransitionParser.js # Transition parsing
│
├── ui/
│   ├── TapeView.js         # Tape visualization
│   ├── ControlPanel.js     # Controls (run, step, replay)
│   ├── BreakpointPanel.js  # Breakpoint management
│   ├── StressTestUI.js     # Batch testing
│   └── IDTraceView.js      # Computation trace
│
├── builder/
│   ├── BuilderUI.js        # Custom machine input
│   └── Validator.js        # Validation logic
│
└── machines/               # Predefined examples
```

---

## ⚙️ Core Concept

A Turing Machine is defined as:

```
M = (Q, Σ, Γ, δ, q₀, qₐ, B)
```

* **Q** — set of states
* **Σ** — input alphabet
* **Γ** — tape alphabet
* **δ** — transition function
* **q₀** — start state
* **qₐ** — accept state
* **B** — blank symbol (`_`)

---

### 🔄 Step Execution Logic

Each step follows:

1. Read symbol under head
2. Find transition δ(state, symbol)
3. If no transition → REJECT
4. Write new symbol
5. Move head (L / R / S)
6. Update state
7. Increment step count
8. Check for ACCEPT

---

## 🚀 Getting Started

Run the project using a local server:

```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

Open:

```
http://localhost:8080
```

---

## 🎯 Highlights

* Converts abstract theory into visual simulation
* Provides debugger-like control over computation
* Supports custom machine creation
* Enables analysis of computational behavior

---

## 🧠 Final Note

This project is designed not just to simulate a Turing Machine, but to act as an **interactive computation debugger**, making theoretical concepts easier to understand and explore.

---
