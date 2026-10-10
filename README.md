# symptom2cure - Symptom2Cure Demo (Kent Repertory Ingestion & Repertorization)
*SGP Project Repository*

A clinical repertorization portal for Kent Repertory data featuring a FastAPI backend, an optional Streamlit analytical UI, and a modern React + Vite + Tailwind CSS frontend.

---

## 🚀 Features

- **Kent Repertory Database Integration**: Seamless querying of rubrics, remedies, and remedies-to-rubrics mappings via Supabase PostgreSQL or local offline CSV fallbacks.
- **FastAPI Clinical Backend**: High-performance REST API with in-memory caching for rapid rubric querying and repertorization analysis.
- **Modern React Frontend**: Interactive web interface (Vite + Tailwind CSS) with chapter navigation, omni-search, symptom basket, and Materia Medica drawers.
- **Streamlit Analytical Portal**: Streamlit-based interface for exploratory analysis and data inspection.

---

## 📁 Project Structure

```text
├── frontend/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/                      # Source code (Components, App, CSS)
│   ├── index.html                # Entry HTML
│   ├── package.json              # Frontend dependencies and scripts
│   ├── vite.config.js            # Vite configuration
│   └── tailwind.config.js        # Tailwind CSS configuration
├── app.py                        # Streamlit web application
├── server.py                     # FastAPI REST API backend
├── engine.py                     # Homeopathic repertorization engine
├── remedies_rows.csv             # Fallback dataset: Remedies
├── rubrics_rows.csv              # Fallback dataset: Rubrics
├── rubric_remedies_rows-v2.csv   # Fallback dataset: Mappings
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment configuration template
└── README.md
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.x or higher
- **npm** or **yarn**

### 2. Backend Setup

1. **Clone the repository**:
   ```bash
   git clone <REPO_URL>
   cd "Symptom2Cure Demo"
   ```

2. **Create and activate a virtual environment**:
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate

   # macOS / Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables (Optional)**:
   Copy `.env.example` to `.env` and configure your database connection string:
   ```bash
   cp .env.example .env
   ```
   *(If not provided, the engine automatically falls back to local CSV mode).*

5. **Run the FastAPI Server**:
   ```bash
   uvicorn server:app --reload --port 8000
   ```
   Interactive Swagger docs will be available at `http://localhost:8000/docs`.

6. **(Alternative) Run the Streamlit Portal**:
   ```bash
   streamlit run app.py
   ```

---

### 3. Frontend Setup

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open the frontend in your browser at the URL shown in the terminal (typically `http://localhost:5173`).

---

## 🔒 Security Note
Never commit actual `.env` files or hardcoded database passwords to version control. Always copy `.env.example` to `.env` locally.
>>>>>>> 5d13113 (feat: initial commit of Symptom2Cure Demo (FastAPI backend + Vite React frontend))
